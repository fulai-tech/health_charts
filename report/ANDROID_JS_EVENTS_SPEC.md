# H5 → Android 事件接口

> 仅约定：如何接收、消息格式、事件名规范、各事件 data 含义。业务逻辑由 Android 自行处理。

---

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
| `data-{pagename}-received` | H5 确认收到数据 |
| `data-{pagename}-request` | H5 请求数据 |
| `click-{pagename}-card` | 卡片/条目点击 |
| **`click-weekly-suggestion`** | **周报页「查看详情」点击** |

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

**解析示例（Kotlin）：**

```kotlin
@JavascriptInterface
fun onJsMessage(payload: String) {
    val json = JSONObject(payload)
    val event = json.getString("event")
    val data = if (json.has("data") && !json.isNull("data")) json.getJSONObject("data") else null
    val pageId = json.optString("pageId", "")
    val timestamp = json.optLong("timestamp", 0L)
    // 根据 event 分发，业务逻辑由 Android 自行实现
}
```

---

## 3. data 含义表

（按 event 维护，不同事件 data 含义独立定义。）

| event | data 含义 |
|-------|-----------|
| `page-{pagename}-ready` | `{ pageId?, pageName?, timestamp? }` |
| `page-{pagename}-close` | 预留，由业务定义 |
| `data-{pagename}-received` | `{ success?, timestamp? }` |
| `data-{pagename}-request` | `{}` 或业务参数 |
| `click-{pagename}-card` | 视页面而定，如 `{ cardType?, cardIndex?, card?, data? }` |
| **`click-weekly-suggestion`** | **`{ suggestionId: string }`** — 建议唯一 ID，用于跳转/拉取详情 |

---

## 4. 后续扩展

新增事件时：**先在「0. 已登记事件」登记事件名**，再在「3. data 含义表」补充该事件的 data 含义。解析方式不变（始终先解析 `event`、`data`、`pageId`、`timestamp`，再按 event 使用 data）。
