# H5 → Android 事件接口

## 0. 事件名规范与维护列表

### 命名规范

事件名按类型统一为以下模式（`{pagename}` 为页面标识，如 weekly、music、sleep 等）：

| 类型 | 模式 | 示例 |
|------|------|------|
| 页面生命周期 | `page-{pagename}-ready` | 页面就绪 |
| | `page-{pagename}-close` | 页面关闭（预留） |
| 数据 | `data-{pagename}-received` | H5 确认收到原生下发的数据 |
| | `data-{pagename}-request` | H5 向原生请求数据 |
| 点击 | `click-{pagename}-card` | 卡片/条目点击 |
| | `click-{pagename}-{具体动作}` | 其他点击（如 suggestion、view-all） |

- 对于没有具体的页面的数据通讯可以采用"global"这个特殊的pagename
- 前端发送时 **event 必须符合上表模式**，不得自造未约定字符串。
- 新增事件：先在本节「已登记事件」追加一行，再在「3. data 含义表」补充该事件的 data 约定。

### 已登记事件

| event | 说明 |
|--------|------|
| `page-{pagename}-ready` | 页面就绪（桥接初始化后自动发） |
| `page-{pagename}-close` | 页面关闭（预留） |
| **`page-global-ready`** | **页面全局就绪（WebView 容器加载完成，等待 Android 触发入场动画）** |
| **`page-global-animate`** | **入场动画触发信号（Android -> JS，收到后 H5 开始播放入场动画）** |
| `data-{pagename}-received` | H5 确认收到数据 |
| `data-{pagename}-request` | H5 请求数据 |
| `click-{pagename}-card` | 卡片/条目点击 |
| **`click-weekly-suggestion`** | **周报页「查看详情」点击** |
| **`click-widget-plan-add`** | **改善计划 Widget「添加」按钮点击** |
| **`click-widget-plan-select`** | **改善计划 Widget「已选择」按钮点击** |
| **`click-widget-video-start`** | **健康干预 Widget「开始播放」按钮点击** |
| **`page-widget-ppg-start`** | **PPG 信号 Widget 测量开始信号（Android -> JS）** |
| **`page-widget-ppg-stop`** | **PPG 信号 Widget 测量结束信号（Android -> JS）** |

**注意：** 标注为 "Android -> JS" 的事件是由 Android 端通过 `NativeBridge.receiveData()` 发送给 H5 的，H5 不会主动发送这些事件。

---

## 1. 接收方式

- H5 通过 **`window.android.onJsMessage(payload)`** 发消息。
- `payload` 为 **单个 JSON 字符串**，需在 Android 端 `JSONObject(payload)` 解析。
- 注入时接口名必须为 **`"android"`**：`addJavascriptInterface(handler, "android")`。

---

## 2. 消息格式（统一）

每条消息均为同一结构，解析后按 `event` 分发，`data` 为可选业务数据：

```json
{
  "event": "事件名",
  "data": { },
  "pageId": "页面标识",
  "timestamp": 1738500000000
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `event` | string | 事件名，用于分发 |
| `data` | object \| null | 可选，事件负载，含义见「3. data 含义表」 |
| `pageId` | string | 来源页面标识 |
| `timestamp` | number | 毫秒时间戳 |


## 3. data 含义表

（按 event 维护，不同事件 data 含义独立定义。）

| event | data 含义 |
|-------|-----------|
| `page-{pagename}-ready` | `{ pageId?, pageName?, timestamp? }` |
| `page-{pagename}-close` | 预留，由业务定义 |
| **`page-global-ready`** | **`{ pageId: string, timestamp: number }`** — H5 发送，表示 WebView 容器已加载完成，等待 Android 触发入场动画 |
| **`page-global-animate`** | **`{ timestamp?: number }`** — Android 发送，H5 收到后开始播放入场动画。开发环境下如果 500ms 内未收到此信号，H5 会自动触发动画 |
| `data-{pagename}-received` | `{ success?, timestamp? }` |
| `data-{pagename}-request` | `{}` 或业务参数 |
| `click-{pagename}-card` | 视页面而定，如 `{ cardType?, cardIndex?, card?, data? }` |
| **`click-weekly-suggestion`** | **`{ suggestionId: string }`** — 建议唯一 ID，用于跳转/拉取详情 |
| **`click-widget-plan-add`** | **`{ itemId: string, itemType: string, itemTitle: string }`** — 点击添加的改善计划项目信息 |
| **`click-widget-plan-select`** | **无（data 可为空或不传）** — 仅点击「已选择」按钮，无需传递业务数据 |
| **`click-widget-video-start`** | **`{ pageId: string, videoUrl: string }`** — 健康干预 Widget「开始播放」按钮点击，携带页面标识和视频地址 |
| **`page-widget-ppg-start`** | **`{ timestamp?: number }`** — Android 发送的测量开始信号，timestamp 为开始时间戳（可选） |
| **`page-widget-ppg-stop`** | **`{ timestamp?: number }`** — Android 发送的测量结束信号，timestamp 为结束时间戳（可选） |

---

## 4. Android -> JS 事件发送方式

对于需要 Android 向 H5 发送信号的场景（如 `page-global-animate`、`page-widget-ppg-start` 等），Android 端应通过 **`NativeBridge.receiveData()`** 方法发送：

### 4.1 入场动画触发示例

```kotlin
// 当 H5 发送 page-global-ready 后，Android 决定触发入场动画时调用：
webView.evaluateJavascript(
    """NativeBridge.receiveData('{"event":"page-global-animate"}')""",
    null
)
```

### 4.2 PPG 测量信号示例

```kotlin
// 开始测量
webView.evaluateJavascript(
    """NativeBridge.receiveData('{"event":"page-widget-ppg-start","data":{"timestamp":${System.currentTimeMillis()}}}')""",
    null
)

// 结束测量
webView.evaluateJavascript(
    """NativeBridge.receiveData('{"event":"page-widget-ppg-stop","data":{"timestamp":${System.currentTimeMillis()}}}')""",
    null
)
```

**重要：** 所有 Android -> JS 的事件都必须通过 `NativeBridge.receiveData()` 发送，不要直接调用其他全局函数。这确保了所有通信都经过统一的桥接层处理。

---

## 5. 后续扩展

新增事件时：**先在「0. 已登记事件」登记事件名**，再在「3. data 含义表」补充该事件的 data 含义。解析方式不变（始终先解析 `event`、`data`、`pageId`、`timestamp`，再按 event 使用 data）。

