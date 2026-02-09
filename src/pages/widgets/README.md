# Widget 组件参数格式文档

本文档定义了所有 Widget 页面通过 URL 参数接收数据的格式规范。

## 通用说明

- **路由格式**: `/widget/:type/trend`
- **参数名**: `data`
- **参数类型**: JSON 字符串（需要 URL 编码）
- **组件**: 使用与详情页相同的 `*TrendyReportCard` 组件

### 使用方式

```javascript
const data = { /* DomainModel 数据 */ }
const url = `/widget/heart-rate/trend?data=${encodeURIComponent(JSON.stringify(data))}`
```

---

## 1. 心率趋势 Widget

**路由**: `/widget/heart-rate/trend`  
**组件**: `HRTrendyReportCard`  
**数据类型**: `HRDomainModel`

### 必需字段

```typescript
interface HRDomainModel {
  chartData: Array<{
    weekdayKey: string  // 翻译键，如 "weekday.mon"
    max: number         // 最大心率
    min: number         // 最小心率
    avg: number         // 平均心率
  }>
  yAxisRange: { min: number; max: number }
  averageLine: number   // 平均线值
  summary: {
    avgValue: number
    minValue: number
    maxValue: number
    minWeekdayKey: string
    maxWeekdayKey: string
    previousAvg: number
    trend: 'up' | 'down' | 'stable'
    changeValue: number
  }
}
```

### 示例数据

```json
{
  "chartData": [
    { "weekdayKey": "weekday.mon", "max": 85, "min": 60, "avg": 72 },
    { "weekdayKey": "weekday.tue", "max": 88, "min": 62, "avg": 75 },
    { "weekdayKey": "weekday.wed", "max": 82, "min": 58, "avg": 70 },
    { "weekdayKey": "weekday.thu", "max": 90, "min": 65, "avg": 78 },
    { "weekdayKey": "weekday.fri", "max": 84, "min": 60, "avg": 72 },
    { "weekdayKey": "weekday.sat", "max": 80, "min": 55, "avg": 68 },
    { "weekdayKey": "weekday.sun", "max": 83, "min": 58, "avg": 70 }
  ],
  "yAxisRange": { "min": 50, "max": 120 },
  "averageLine": 72,
  "summary": {
    "avgValue": 72,
    "minValue": 55,
    "maxValue": 90,
    "minWeekdayKey": "weekday.sat",
    "maxWeekdayKey": "weekday.thu",
    "previousAvg": 70,
    "trend": "up",
    "changeValue": 2
  }
}
```

---

## 2. 血糖趋势 Widget

**路由**: `/widget/glucose/trend`  
**组件**: `GlucoseTrendyReportCard`  
**数据类型**: `GlucoseDomainModel`

### 必需字段

```typescript
interface GlucoseDomainModel {
  chartData: Array<{
    weekdayKey: string
    max: number         // mmol/L
    min: number
    avg: number
  }>
  yAxisRange: { min: number; max: number }
  averageLine: number
  normalRange: { min: number; max: number }
  summary: {
    avgValue: number
    minValue: number
    maxValue: number
    minWeekdayKey: string
    maxWeekdayKey: string
    previousAvg: number
    trend: 'up' | 'down' | 'stable'
    changeValue: number
  }
}
```

### 示例数据

```json
{
  "chartData": [
    { "weekdayKey": "weekday.mon", "max": 6.5, "min": 4.5, "avg": 5.5 },
    { "weekdayKey": "weekday.tue", "max": 7.0, "min": 4.8, "avg": 5.8 },
    { "weekdayKey": "weekday.wed", "max": 6.8, "min": 4.6, "avg": 5.6 },
    { "weekdayKey": "weekday.thu", "max": 6.4, "min": 4.4, "avg": 5.4 },
    { "weekdayKey": "weekday.fri", "max": 6.9, "min": 4.7, "avg": 5.7 },
    { "weekdayKey": "weekday.sat", "max": 6.6, "min": 4.5, "avg": 5.5 },
    { "weekdayKey": "weekday.sun", "max": 6.7, "min": 4.6, "avg": 5.6 }
  ],
  "yAxisRange": { "min": 3, "max": 10 },
  "averageLine": 5.5,
  "normalRange": { "min": 3.9, "max": 6.1 },
  "summary": {
    "avgValue": 5.6,
    "minValue": 4.4,
    "maxValue": 7.0,
    "minWeekdayKey": "weekday.thu",
    "maxWeekdayKey": "weekday.tue",
    "previousAvg": 5.4,
    "trend": "up",
    "changeValue": 0.2
  }
}
```

---

## 3. 血氧趋势 Widget

**路由**: `/widget/spo2/trend`  
**组件**: `SpO2TrendyReportCard`  
**数据类型**: `SpO2DomainModel`

### 必需字段

```typescript
interface SpO2DomainModel {
  chartData: Array<{
    weekdayKey: string
    max: number         // %
    min: number
    avg: number
  }>
  yAxisRange: { min: number; max: number }
  averageLine: number
  summary: {
    avgValue: number
    minValue: number
    maxValue: number
    minWeekdayKey: string
    maxWeekdayKey: string
    previousAvg: number
    trend: 'up' | 'down' | 'stable'
    changeValue: number
  }
}
```

### 示例数据

```json
{
  "chartData": [
    { "weekdayKey": "weekday.mon", "max": 99, "min": 96, "avg": 97 },
    { "weekdayKey": "weekday.tue", "max": 98, "min": 95, "avg": 97 },
    { "weekdayKey": "weekday.wed", "max": 99, "min": 96, "avg": 98 },
    { "weekdayKey": "weekday.thu", "max": 98, "min": 95, "avg": 97 },
    { "weekdayKey": "weekday.fri", "max": 99, "min": 96, "avg": 97 },
    { "weekdayKey": "weekday.sat", "max": 99, "min": 97, "avg": 98 },
    { "weekdayKey": "weekday.sun", "max": 98, "min": 96, "avg": 97 }
  ],
  "yAxisRange": { "min": 90, "max": 100 },
  "averageLine": 97,
  "summary": {
    "avgValue": 97,
    "minValue": 95,
    "maxValue": 99,
    "minWeekdayKey": "weekday.tue",
    "maxWeekdayKey": "weekday.mon",
    "previousAvg": 96,
    "trend": "up",
    "changeValue": 1
  }
}
```

---

## 4. 血压趋势 Widget

**路由**: `/widget/blood-pressure/trend`  
**组件**: `BPTrendyReportCard`  
**数据类型**: `BPDomainModel`

### 必需字段

```typescript
interface BPDomainModel {
  chartData: Array<{
    systolic: number    // 收缩压
    diastolic: number   // 舒张压
  }>
  yAxisRange: { min: number; max: number }
  summary: {
    avgSystolic: number
    avgDiastolic: number
  }
}
```

### 示例数据

```json
{
  "chartData": [
    { "systolic": 120, "diastolic": 80 },
    { "systolic": 118, "diastolic": 78 },
    { "systolic": 122, "diastolic": 82 },
    { "systolic": 119, "diastolic": 79 },
    { "systolic": 121, "diastolic": 81 },
    { "systolic": 117, "diastolic": 77 },
    { "systolic": 120, "diastolic": 80 }
  ],
  "yAxisRange": { "min": 50, "max": 150 },
  "summary": {
    "avgSystolic": 120,
    "avgDiastolic": 79
  }
}
```

---

## JavaScript 使用示例

### 生成 URL

```javascript
const hrData = {
  chartData: [
    { weekdayKey: "weekday.mon", max: 85, min: 60, avg: 72 },
    // ... 更多数据
  ],
  yAxisRange: { min: 50, max: 120 },
  averageLine: 72,
  summary: {
    avgValue: 72,
    minValue: 55,
    maxValue: 90,
    minWeekdayKey: "weekday.sat",
    maxWeekdayKey: "weekday.thu",
    previousAvg: 70,
    trend: "up",
    changeValue: 2
  }
}

const url = `/widget/heart-rate/trend?data=${encodeURIComponent(JSON.stringify(hrData))}`
```

### React iframe 嵌入

```tsx
function WidgetEmbed({ type, data }) {
  const url = useMemo(() => {
    return `/widget/${type}/trend?data=${encodeURIComponent(JSON.stringify(data))}`
  }, [type, data])

  return <iframe src={url} width="100%" height="400" frameBorder="0" />
}
```

---

## 5. HRE 推荐 Widget (Type 12)

**路由**: `/widget/type-12`  
**组件**: `Type12_HRERecommendationWidgetPage`  
**数据类型**: `HRERecommendationData`  
**通信方式**: NativeBridge（Android -> JS）

### 功能说明

展示 HRE（Health Recommendation Engine）推荐的健康内容。支持四种展示模式：

| 模式 | 条件 | 展示内容 |
|------|------|----------|
| 视频推荐 | `has_match=true` + `type=video` | 图片 + 时长徽章 + 标题 + Start + 详情 |
| 音频推荐 | `has_match=true` + `type=audio` | 图片 + 时长徽章 + 标题 + Start + 详情 |
| 图文推荐 | `has_match=true` + `type=image_text` | 图片 + 标题 + Start + 详情（无时长） |
| 纯文本 | `has_match=false` | 仅标题 + 简介 + 详情文字 |

**注意**: 一期只取 `rank=1` 的首个推荐进行展示。

### 数据类型

```typescript
interface HRERecommendationItem {
  content_id?: string                                    // 内容唯一标识
  type?: 'video' | 'audio' | 'image_text'               // 媒体类型
  content_type?: 'exercise' | 'food' | 'music' | 'sleep' | 'other'  // 内容分类
  image_url?: string                                     // 主图 URL
  url?: string                                           // 内容 URL（video/audio 有；image_text 无此字段）
  minutes?: number                                       // 时长（分钟）
  title: string                                          // 标题文字
  explanation_text: string                               // 简介文字
  detailed_text: string                                  // 详细介绍文字
  has_match: boolean                                     // 是否从内容库推荐
  rank: number                                           // 排名（一期取首个）
  total_count: number                                    // 总推荐数
}

interface HRERecommendationData {
  hre_recommendations: HRERecommendationItem[]
}
```

### 示例数据

#### 视频推荐（有匹配）

```json
{
  "hre_recommendations": [{
    "content_id": "697c7ee5492c5a6580b1fe85",
    "type": "video",
    "content_type": "exercise",
    "image_url": "https://cdn.fulai.tech/comm/image/1769750270125_456l864te",
    "url": "https://cdn.fulai.tech/comm/video/1769749075286_73302i411",
    "minutes": 15,
    "title": "Gentle 5-Minute Move",
    "explanation_text": "Knees bent, arm swing, leg kick, waist twist, ankle rotation, stretch & breathe.",
    "detailed_text": "As someone with gout and blood sugar concerns, this easy workout is great for you!",
    "has_match": true,
    "rank": 1,
    "total_count": 1
  }]
}
```

#### 纯文本推荐（无匹配）

```json
{
  "hre_recommendations": [{
    "title": "Take a Short Walk",
    "explanation_text": "A 10-minute walk after meals can help regulate blood sugar levels.",
    "detailed_text": "Research shows that even a brief walk after eating can significantly reduce post-meal blood sugar spikes.",
    "has_match": false,
    "rank": 1,
    "total_count": 1
  }]
}
```

### Android 端调用

```kotlin
// 发送数据
val jsonData = """{"hre_recommendations": [{...}]}"""
webView.evaluateJavascript(
    "NativeBridge.receiveData('${jsonData.replace("'", "\\'")}')",
    null
)

// 监听事件
// click-start: 用户点击 Start 按钮
// cardClick: 用户点击卡片
```

---

## 注意事项

1. **URL 编码**: JSON 必须使用 `encodeURIComponent` 编码
2. **数据可选**: 如果不传 `data` 参数，组件会显示占位符数据
3. **weekdayKey**: 使用翻译键（如 `weekday.mon`），组件会自动翻译
4. **chartData 长度**: 通常为 7 天（周一到周日）
