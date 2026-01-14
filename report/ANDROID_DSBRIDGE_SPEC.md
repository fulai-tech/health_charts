# Android 端 DSBridge 通信接口规范

本文档定义了 Android 端与 H5 Widget 组件的通信接口规范，基于 [DSBridge-Android](https://github.com/nickreddock/DSBridge-Android) 实现。

---

## 一、依赖配置

### 1. 添加依赖

```gradle
// build.gradle (app)
dependencies {
    implementation 'com.github.nickreddock:DSBridge-Android:3.0.0'
}
```

### 2. WebView 初始化

```kotlin
import wendu.dsbridge.DWebView

class WidgetActivity : AppCompatActivity() {
    private lateinit var webView: DWebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        webView = DWebView(this)
        setContentView(webView)
        
        // 注册原生方法供 JS 调用
        webView.addJavascriptObject(NativeBridge(this), "native")
        
        // 加载 Widget 页面
        webView.loadUrl("file:///android_asset/index.html#/widget/music")
    }
}
```

---

## 二、通信架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        Android 原生                              │
├─────────────────────────────────────────────────────────────────┤
│  NativeBridge (注册到 "native" 命名空间)                          │
│  ├── onPageReady(info)     ← JS 页面就绪时调用                    │
│  └── onJsMessage(message)  ← JS 发送事件时调用                    │
├─────────────────────────────────────────────────────────────────┤
│                         DSBridge                                 │
├─────────────────────────────────────────────────────────────────┤
│  JS 注册的方法 (每个 Widget 不同)                                 │
│  ├── setData(jsonData)     → 原生调用，推送数据给 JS               │
│  └── getPageInfo()         → 原生调用，获取页面信息                │
├─────────────────────────────────────────────────────────────────┤
│                        H5 Widget                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 三、原生需要实现的接口

### NativeBridge.kt

```kotlin
import wendu.dsbridge.OnReturnValue
import org.json.JSONObject

/**
 * 原生桥接类 - 注册到 "native" 命名空间
 * JS 通过 dsBridge.call("native.xxx", data) 调用
 */
class NativeBridge(private val context: Context) {

    /**
     * 页面就绪回调
     * JS 页面加载完成后会自动调用此方法
     * 
     * @param info JSON 格式: { "pageId": "music", "pageName": "音乐推荐", "timestamp": 1234567890 }
     */
    @JavascriptInterface
    fun onPageReady(info: Any?): String {
        val json = JSONObject(info.toString())
        val pageId = json.optString("pageId")
        val pageName = json.optString("pageName")
        val timestamp = json.optLong("timestamp")
        
        Log.d("NativeBridge", "页面就绪: pageId=$pageId, pageName=$pageName")
        
        // TODO: 页面就绪后，可以开始推送数据
        // 例如: 延迟 100ms 后推送初始数据
        Handler(Looper.getMainLooper()).postDelayed({
            pushDataToWidget(pageId)
        }, 100)
        
        return JSONObject().apply {
            put("success", true)
            put("message", "received")
        }.toString()
    }

    /**
     * 接收 JS 发送的事件
     * JS 通过 send('eventName', data) 发送
     * 
     * @param message JSON 格式: { "event": "cardClick", "data": {...}, "pageId": "music", "timestamp": 1234567890 }
     */
    @JavascriptInterface
    fun onJsMessage(message: Any?): String {
        val json = JSONObject(message.toString())
        val event = json.optString("event")
        val pageId = json.optString("pageId")
        val data = json.optJSONObject("data")
        
        Log.d("NativeBridge", "收到JS事件: event=$event, pageId=$pageId, data=$data")
        
        // 根据事件类型处理
        when (event) {
            "cardClick" -> handleCardClick(pageId, data)
            "requestData" -> handleRequestData(pageId, data)
            else -> Log.w("NativeBridge", "未知事件: $event")
        }
        
        return JSONObject().apply {
            put("success", true)
        }.toString()
    }

    private fun handleCardClick(pageId: String, data: JSONObject?) {
        val cardIndex = data?.optInt("cardIndex") ?: -1
        // TODO: 处理卡片点击，例如跳转到音乐播放页
        Log.d("NativeBridge", "卡片点击: index=$cardIndex")
    }

    private fun handleRequestData(pageId: String, data: JSONObject?) {
        // TODO: 处理数据请求
    }
}
```

---

## 四、原生推送数据到 JS

### 1. 基础调用方式

```kotlin
class WidgetActivity : AppCompatActivity() {
    private lateinit var webView: DWebView

    /**
     * 推送数据到 Widget
     * 调用 JS 注册的 setData 方法
     */
    fun pushDataToWidget(pageId: String) {
        when (pageId) {
            "music" -> pushMusicData()
            "weather" -> pushWeatherData()
            // ... 其他 Widget
        }
    }

    private fun pushMusicData() {
        // 构建数据 (根据业务需求)
        val musicData = JSONObject().apply {
            put("items", JSONArray().apply {
                put(JSONObject().apply {
                    put("id", 1)
                    put("title", "轻音乐")
                    put("text", "[轻音乐] (放松、舒缓、减压、治愈)")
                    put("imageUrl", "https://example.com/image1.jpg")
                })
                put(JSONObject().apply {
                    put("id", 2)
                    put("title", "禅音疗法")
                    put("text", "禅音疗法 | 冥想、失眠缓解")
                    put("imageUrl", "https://example.com/image2.jpg")
                })
            })
        }

        // 调用 JS 的 setData 方法
        webView.callHandler("setData", arrayOf(musicData.toString())) { returnValue ->
            // JS 返回值: { "success": true, "count": 2 }
            val result = JSONObject(returnValue)
            val success = result.optBoolean("success")
            val count = result.optInt("count")
            Log.d("WidgetActivity", "数据推送结果: success=$success, count=$count")
        }
    }
}
```

### 2. 封装工具类

```kotlin
/**
 * Widget 通信管理器
 */
class WidgetBridgeManager(private val webView: DWebView) {

    /**
     * 推送数据到 JS
     * @param methodName JS 注册的方法名 (如 "setData")
     * @param data 要发送的数据 (会自动转为 JSON 字符串)
     * @param callback 回调
     */
    fun callJs(
        methodName: String,
        data: Any,
        callback: ((success: Boolean, result: JSONObject?) -> Unit)? = null
    ) {
        val jsonData = when (data) {
            is JSONObject -> data.toString()
            is JSONArray -> data.toString()
            is String -> data
            else -> JSONObject().put("data", data).toString()
        }

        webView.callHandler(methodName, arrayOf(jsonData)) { returnValue ->
            try {
                val result = JSONObject(returnValue)
                callback?.invoke(result.optBoolean("success", false), result)
            } catch (e: Exception) {
                Log.e("WidgetBridge", "解析返回值失败: $returnValue", e)
                callback?.invoke(false, null)
            }
        }
    }

    /**
     * 推送音乐数据
     */
    fun pushMusicData(items: List<MusicItem>, callback: ((success: Boolean) -> Unit)? = null) {
        val data = JSONObject().apply {
            put("items", JSONArray().apply {
                items.forEach { item ->
                    put(JSONObject().apply {
                        put("id", item.id)
                        put("title", item.title)
                        put("text", item.text)
                        put("imageUrl", item.imageUrl)
                    })
                }
            })
        }
        
        callJs("setData", data) { success, _ ->
            callback?.invoke(success)
        }
    }
}

data class MusicItem(
    val id: Int,
    val title: String,
    val text: String,
    val imageUrl: String
)
```

---

## 五、数据格式规范

### 1. 通用响应格式

```json
{
  "success": true,
  "message": "optional error message",
  "data": { ... }
}
```

### 2. Music Widget 数据格式

#### 推送数据 (原生 → JS)

```json
// 方式一：items 数组
{
  "items": [
    {
      "id": 1,
      "title": "轻音乐",
      "text": "[轻音乐] (放松、舒缓、减压、治愈)",
      "imageUrl": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop&q=80"
    },
    {
      "id": 2,
      "title": "禅音疗法", 
      "text": "禅音疗法 | 冥想、失眠缓解",
      "imageUrl": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop&q=80"
    }
  ]
}

// 方式二：data 数组 (也支持)
{
  "data": [ ... ]
}

// 方式三：直接数组 (也支持)
[ ... ]
```

#### 卡片字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 否 | 卡片唯一标识 |
| title | string | 否 | 卡片标题 (用于 alt 属性) |
| text | string | 是 | 卡片描述文字 |
| imageUrl | string | 是* | 图片 URL |
| imageBase64 | string | 是* | Base64 图片 (与 imageUrl 二选一) |
| description | string | 否 | 备用描述字段 (如果 text 为空则使用) |

#### 卡片点击事件 (JS → 原生)

```json
{
  "event": "cardClick",
  "pageId": "music",
  "timestamp": 1704067200000,
  "data": {
    "cardIndex": 0,
    "card": {
      "id": 1,
      "title": "轻音乐",
      "text": "[轻音乐] (放松、舒缓、减压、治愈)",
      "imageUrl": "https://example.com/image1.jpg"
    }
  }
}
```

---

## 六、完整调用时序

```
┌──────────┐                    ┌──────────┐
│  Android │                    │   H5 JS  │
└────┬─────┘                    └────┬─────┘
     │                               │
     │  1. loadUrl(widget/music)     │
     │──────────────────────────────>│
     │                               │
     │                               │ 2. 页面加载完成
     │                               │    注册 setData 方法
     │                               │
     │  3. native.onPageReady()      │
     │<──────────────────────────────│
     │  { pageId: "music", ... }     │
     │                               │
     │  4. callHandler("setData")    │
     │──────────────────────────────>│
     │  { items: [...] }             │
     │                               │ 5. 解析数据，渲染 UI
     │                               │
     │  6. 返回结果                   │
     │<──────────────────────────────│
     │  { success: true, count: 2 }  │
     │                               │
     │         ... 用户操作 ...       │
     │                               │
     │  7. native.onJsMessage()      │
     │<──────────────────────────────│
     │  { event: "cardClick", ... }  │
     │                               │
     │  8. 处理点击事件               │
     │                               │
```

---

## 七、错误处理

### 1. JS 方法不存在

```kotlin
// 检查 JS 方法是否已注册
webView.callHandler("_hasJavascriptMethod", arrayOf("setData")) { exists ->
    if (exists == "true") {
        // 方法存在，可以调用
        pushMusicData()
    } else {
        // 方法不存在，可能页面还未就绪
        Log.w("Widget", "setData 方法未注册，等待页面就绪")
    }
}
```

### 2. 超时处理

```kotlin
fun pushDataWithTimeout(data: JSONObject, timeoutMs: Long = 5000) {
    val handler = Handler(Looper.getMainLooper())
    var isTimeout = false
    
    val timeoutRunnable = Runnable {
        isTimeout = true
        Log.e("Widget", "数据推送超时")
    }
    handler.postDelayed(timeoutRunnable, timeoutMs)
    
    webView.callHandler("setData", arrayOf(data.toString())) { result ->
        if (!isTimeout) {
            handler.removeCallbacks(timeoutRunnable)
            Log.d("Widget", "数据推送成功: $result")
        }
    }
}
```

---

## 八、其他 Widget 扩展

新增 Widget 时，只需要定义该 Widget 特有的数据格式，通信层复用：

### Weather Widget 示例

```kotlin
fun pushWeatherData(weatherInfo: WeatherInfo) {
    val data = JSONObject().apply {
        put("city", weatherInfo.city)
        put("temperature", weatherInfo.temperature)
        put("condition", weatherInfo.condition)
        put("humidity", weatherInfo.humidity)
        put("forecast", JSONArray().apply {
            weatherInfo.forecast.forEach { day ->
                put(JSONObject().apply {
                    put("date", day.date)
                    put("high", day.high)
                    put("low", day.low)
                    put("condition", day.condition)
                })
            }
        })
    }
    
    webView.callHandler("setData", arrayOf(data.toString())) { result ->
        // 处理结果
    }
}
```

---

## 九、调试技巧

### 1. 开启 WebView 调试

```kotlin
if (BuildConfig.DEBUG) {
    WebView.setWebContentsDebuggingEnabled(true)
}
```

### 2. Chrome DevTools 调试

1. 手机连接电脑，开启 USB 调试
2. Chrome 访问 `chrome://inspect`
3. 找到对应 WebView，点击 `inspect`
4. 在 Console 中查看 `[DSBridge]` 开头的日志

### 3. 模拟 JS 调用

```javascript
// 在 Chrome DevTools Console 中测试
dsBridge.call("native.onPageReady", { pageId: "test", timestamp: Date.now() })
```
