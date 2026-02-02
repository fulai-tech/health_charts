# Android 原生通信接口规范

> 本文档定义了 Android 与 H5 Widget 页面的通信接口规范
> 
> **通信方式：** 原生 JavaScript Bridge（`window.android.onJsMessage` / `NativeBridge.receiveData`）
> 
> **给 Android 端复制用（仅格式与事件 data 结构，解耦业务）：** [ANDROID_JS_EVENTS_SPEC.md](./ANDROID_JS_EVENTS_SPEC.md)

## 目录

1. [通信架构](#通信架构)
2. [Android 端实现](#android-端实现)
3. [通信协议](#通信协议)
4. [示例代码](#示例代码)
5. [调试指南](#调试指南)

---

## 通信架构

```
┌─────────────────┐                  ┌─────────────────┐
│   Android App   │                  │   H5 Widget     │
│                 │                  │                 │
│  ┌───────────┐  │   JS -> Native   │  ┌───────────┐  │
│  │ android   │◄─┼──────────────────┼──│  send()   │  │
│  │ .onJs     │  │                  │  │           │  │
│  │ Message() │  │                  │  └───────────┘  │
│  └───────────┘  │                  │                 │
│                 │                  │                 │
│  ┌───────────┐  │  Native -> JS    │  ┌───────────┐  │
│  │ evaluate  │──┼──────────────────┼─►│ Native    │  │
│  │ Javascript│  │                  │  │ Bridge    │  │
│  │           │  │                  │  │ .receive  │  │
│  └───────────┘  │                  │  │ Data()    │  │
└─────────────────┘                  └───────────────────┘
```

### 通信方向

| 方向 | 方法 | 说明 |
|------|------|------|
| JS → Android | `window.android.onJsMessage(jsonString)` | H5 发送事件到原生 |
| Android → JS | `webView.evaluateJavascript("NativeBridge.receiveData('...')")` | 原生发送数据到 H5 |

---

## Android 端实现

### 1. 创建 JavaScript 接口类

```kotlin
/**
 * JavaScript 接口类
 * 用于接收 H5 发送的消息
 */
class WebAppInterface(private val context: Context) {
    
    /**
     * H5 调用此方法发送消息到 Android
     *
     * @param payload JSON 字符串，含 event、data、pageId、timestamp
     * 事件名与 data 含义详见 [ANDROID_JS_EVENTS_SPEC.md](./ANDROID_JS_EVENTS_SPEC.md)
     */
    @JavascriptInterface
    fun onJsMessage(payload: String) {
        try {
            val json = JSONObject(payload)
            val event = json.getString("event")
            val data = json.optJSONObject("data")
            val pageId = json.optString("pageId", "unknown")
            val timestamp = json.optLong("timestamp", 0)
            // 根据 event 分发，事件名与 data 含义详见 ANDROID_JS_EVENTS_SPEC.md
            dispatchEvent(event, pageId, data)
        } catch (e: Exception) {
            Log.e("WebAppInterface", "解析消息失败: ${e.message}")
        }
    }

    private fun dispatchEvent(event: String, pageId: String, data: JSONObject?) {
        // 业务按 event 处理，事件列表与 data 见 ANDROID_JS_EVENTS_SPEC.md
    }
}
```

### 2. WebView 配置

```kotlin
class MusicWidgetActivity : AppCompatActivity() {
    
    private lateinit var webView: WebView
    private lateinit var webAppInterface: WebAppInterface
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_music_widget)
        
        webView = findViewById(R.id.webView)
        webAppInterface = WebAppInterface(this)
        
        setupWebView()
        loadWidget()
    }
    
    private fun setupWebView() {
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = true
            // 可选：调试模式
            if (BuildConfig.DEBUG) {
                WebView.setWebContentsDebuggingEnabled(true)
            }
        }
        
        // 关键：注入 JavaScript 接口，名称必须是 "android"
        webView.addJavascriptInterface(webAppInterface, "android")
        
        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                Log.d("WebView", "页面加载完成: $url")
                // 页面加载完成后，可等待 H5 就绪事件再发数据（事件名见 ANDROID_JS_EVENTS_SPEC.md）
            }
        }
    }
    
    private fun loadWidget() {
        // 加载 H5 页面（使用 hash 路由）
        webView.loadUrl("https://your-domain.com/#/widget/music")
        // 或本地文件
        // webView.loadUrl("file:///android_asset/index.html#/widget/music")
    }
    
    /**
     * 发送音乐数据到 H5
     * 
     * 重要：必须在主线程调用
     */
    fun sendMusicData() {
        val musicData = JSONArray().apply {
            put(JSONObject().apply {
                put("id", 1)
                put("imageUrl", "https://example.com/image1.jpg")
                put("title", "轻音乐")
                put("text", "[轻音乐] (放松、舒缓、减压、治愈)")
            })
            put(JSONObject().apply {
                put("id", 2)
                put("imageUrl", "https://example.com/image2.jpg")
                put("title", "禅音疗法")
                put("text", "禅音疗法 | 冥想、失眠缓解、放松、专注工作 - 纯音乐")
            })
        }
        
        // 转换为 JSON 字符串，注意转义
        val jsonString = musicData.toString()
            .replace("\\", "\\\\")
            .replace("'", "\\'")
        
        // 在主线程中调用 JavaScript
        runOnUiThread {
            webView.evaluateJavascript(
                "NativeBridge.receiveData('$jsonString')",
                null
            )
        }
    }
}
```

---

## 通信协议

### JS → Android 消息格式

```typescript
interface JsToNativeMessage {
  /** 事件名称 */
  event: string
  /** 事件数据 */
  data?: any
  /** 页面标识 */
  pageId: string
  /** 时间戳 */
  timestamp: number
}
```

事件名、data 含义及维护列表详见 [ANDROID_JS_EVENTS_SPEC.md](./ANDROID_JS_EVENTS_SPEC.md)。

### Android → JS 数据格式

音乐卡片数据支持以下格式：

```typescript
// 格式1：直接数组
type MusicData = MusicCardItem[]

// 格式2：items 包装
type MusicData = { items: MusicCardItem[] }

// 格式3：data 包装
type MusicData = { data: MusicCardItem[] }

interface MusicCardItem {
  id?: number
  imageUrl?: string      // 图片 URL
  imageBase64?: string   // 或 Base64 图片
  title?: string
  text?: string          // 卡片描述文字
  description?: string   // 或用 description
}
```

---

## 示例代码

### 发送数据示例

```kotlin
// 方式1：发送数组
val data = """[
    {"id":1,"imageUrl":"https://...","title":"轻音乐","text":"放松音乐"},
    {"id":2,"imageUrl":"https://...","title":"禅音","text":"冥想音乐"}
]"""

webView.evaluateJavascript("NativeBridge.receiveData('$data')", null)

// 方式2：发送对象（包含 items）
val data = """{"items":[...]}"""
webView.evaluateJavascript("NativeBridge.receiveData('$data')", null)
```

### 接收事件示例

解析 `payload` 得到 `event`、`data`、`pageId`、`timestamp` 后按 `event` 分发即可。事件名与 data 含义详见 [ANDROID_JS_EVENTS_SPEC.md](./ANDROID_JS_EVENTS_SPEC.md)。

---

## 调试指南

### 1. Chrome DevTools 调试

在 Android 应用中启用 WebView 调试：

```kotlin
if (BuildConfig.DEBUG) {
    WebView.setWebContentsDebuggingEnabled(true)
}
```

然后在 Chrome 中访问 `chrome://inspect` 查看 WebView。

### 2. 日志输出

H5 端在开发模式会输出详细日志：

```
[NativeBridge][music][INFO] 初始化通信层
[NativeBridge][music][INFO] 通信层初始化完成，已通知原生页面就绪
[NativeBridge][music][INFO] 收到原生数据 [{"id":1...
[NativeBridge][music][INFO] 发送事件: xxx {...}
```

### 3. 模拟测试

在浏览器控制台模拟 Android 发送数据：

```javascript
// 模拟 Android 发送数据
NativeBridge.receiveData(JSON.stringify([
    { id: 1, imageUrl: 'https://...', text: '测试音乐1' },
    { id: 2, imageUrl: 'https://...', text: '测试音乐2' }
]))
```

### 4. 常见问题

**Q: H5 发送消息但 Android 没收到？**

A: 确保 `addJavascriptInterface` 的名称是 `"android"`（必须小写）

```kotlin
webView.addJavascriptInterface(webAppInterface, "android")  // ✅ 正确
webView.addJavascriptInterface(webAppInterface, "Android")  // ❌ 错误
```

**Q: Android 发送数据但 H5 没显示？**

A: 确保：
1. 等待 H5 就绪事件后再发送数据（事件名见 ANDROID_JS_EVENTS_SPEC.md）
2. 使用正确的方法名 `NativeBridge.receiveData`（区分大小写）
3. JSON 字符串正确转义（特别是引号和反斜杠）

**Q: 担心打包后变量名被改变？**

A: 不用担心！我们使用 `window.android` 和 `window.NativeBridge` 访问全局对象，属性名是字符串，不会被 JavaScript minifier 改变。

---

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| 2.1 | 2026-02-02 | 事件名规范化为 `page-xxx-ready` / `click-xxx-xxx` 等；抽离 [ANDROID_JS_EVENTS_SPEC.md](./ANDROID_JS_EVENTS_SPEC.md) 约定接收与 data 含义 |
| 2.0 | 2026-01-14 | 回归原生 JS Bridge 方式，放弃 DSBridge |
| 1.0 | 2026-01-13 | 初始版本，使用 DSBridge |
