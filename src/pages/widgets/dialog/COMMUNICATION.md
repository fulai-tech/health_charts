# Dialog 组件通讯方式文档

本文档说明 `src/pages/widget/dialog` 目录下所有 dialog 组件的通讯机制。

## 概述

所有 dialog 组件都使用统一的 **NativeBridge** 通讯机制，实现 Android 原生应用与 WebView 之间的双向通信。

## 通讯架构

### 核心 Hook: `useNativeBridge`

所有 dialog 组件都通过 `@/hooks/useNativeBridge` hook 进行通讯：

```typescript
const { onData, send, isReady } = useNativeBridge({
  pageId: PAGE_CONFIG.pageId,
  pageName: PAGE_CONFIG.pageName,
  debug: import.meta.env.DEV,
})
```

### 双向通信机制

#### 1. Android → JS（数据接收）

**Android 端调用方式：**
```kotlin
webView.evaluateJavascript("NativeBridge.receiveData('${jsonString}')", null)
```

**JS 端接收：**
- Android 调用 `window.NativeBridge.receiveData(jsonString)` 传递数据
- `useNativeBridge` hook 自动解析 JSON 字符串
- 通过 `onData` 回调传递给业务组件

**使用示例：**
```typescript
useEffect(() => {
  onData((rawData) => {
    console.log('[Widget] 收到原生数据')
    const parsed = parseData(rawData)
    if (parsed) {
      setData(parsed)
    }
  })
}, [onData])
```

#### 2. JS → Android（事件发送）

**JS 端发送：**
```typescript
send('cardClick', { 
  pageId: PAGE_CONFIG.pageId, 
  cardType: 'heart-rate',
  data: {...}
})
```

**Android 端接收：**
- JS 调用 `window.android.onJsMessage(jsonString)` 发送事件
- 消息格式：
```json
{
  "event": "cardClick",
  "data": { "pageId": "...", "cardType": "...", ... },
  "pageId": "vital-overview",
  "timestamp": 1234567890
}
```

## 组件列表

### 1. Type5_VitalOverviewWidgetPage（健康体征总览）

- **文件**: `Type5_VitalOverviewWidgetPage.tsx`
- **路由**: `/widget/type-5`
- **pageId**: `'vital-overview'`
- **type**: `5`
- **数据格式**: `VitalOverviewData`
  ```typescript
  {
    heartRate: { value, unit, statusText, status, highlighted? },
    bloodPressure: { systolic, diastolic, unit, statusText, status, highlighted? },
    spo2: { value, unit, statusText, status, highlighted? },
    poct: { value, unit, statusText, status, highlighted? }
  }
  ```
- **事件**: `cardClick` - 卡片点击时发送，包含 `cardType` 和 `data`

### 2. Type1_SleepScoreWidgetPage（睡眠评分）

- **文件**: `Type1_SleepScoreWidgetPage.tsx`
- **路由**: `/widget/type-1`
- **pageId**: `'sleep-score'`
- **type**: `1`
- **数据格式**: `SleepScoreData`
  ```typescript
  {
    score: number,              // 0-100
    totalSleepMinutes: number,
    deepSleepMinutes: number,
    tags: Array<{ text: string, type: 'warning' | 'good' | 'neutral' }>
  }
  ```
- **事件**: `cardClick` - 卡片点击时发送

### 3. Type3_NutritionIntakeWidgetPage（营养摄入）

- **文件**: `Type3_NutritionIntakeWidgetPage.tsx`
- **路由**: `/widget/type-3`
- **pageId**: `'nutrition-intake'`
- **type**: `3`
- **数据格式**: `NutritionIntakeData`
  ```typescript
  {
    nutritionScore: number,
    totalCalories: number,
    warningTitle: string,
    mealIntake: { value, unit, recommended, exceedPercent },
    dailyIntake: { value, unit, recommended, exceedPercent },
    tipText: string
  }
  ```
- **事件**: `cardClick` - 卡片点击时发送

### 4. Type6_SodiumBPWidgetPage（钠摄入与血压关联）

- **文件**: `Type6_SodiumBPWidgetPage.tsx`
- **路由**: `/widget/type-6`
- **pageId**: `'sodium-bp'`
- **type**: `6`
- **数据格式**: `SodiumBPData`
  ```typescript
  {
    intake: { value, unit, label, percent, level },
    alert: { text, label, level }
  }
  ```
- **事件**: 
  - `cardClick` (cardType: 'intake') - 左侧摄入卡片点击
  - `cardClick` (cardType: 'alert') - 右侧警告卡片点击

### 5. Type2_ComparisonWidgetPage（深睡疲劳对比）

- **文件**: `Type2_ComparisonWidgetPage.tsx`
- **路由**: `/widget/type-2`
- **pageId**: `'sleep-fatigue-comparison'`
- **type**: `2`
- **数据格式**: `SleepFatigueComparisonData`
  ```typescript
  {
    theme?: 'sleep' | 'BP',
    left: { title, value, barPercent, standardPercent, status, statusText },
    right: { title, value, barPercent, standardPercent, status, statusText }
  }
  ```
- **事件**: `cardClick` - 卡片点击时发送

### 6. Type4_MusicWidgetPage（音乐推荐）

- **文件**: `Type4_MusicWidgetPage.tsx`
- **路由**: `/widget/type-4`
- **pageId**: `'music'`
- **type**: `4`
- **数据格式**: `MusicNativeData`
  ```typescript
  {
    items: Array<{
      order: number,
      songId?: string,
      imageUrl?: string,
      imageBase64?: string,
      title?: string,
      text?: string,
      description?: string
    }>
  }
  ```
- **事件**: 
  - `cardClick` - 单个卡片点击，包含 `order`, `songId`, `card`
  - `viewAll` - "查看更多"按钮点击

## 数据格式规范

### 通用规则

1. **最外层必须是 JSON 对象**，不支持数组作为根元素
2. **数据可以是 JSON 字符串或已解析的对象**
3. **所有组件都有默认数据（DEFAULT_DATA）**，用于开发调试和 fallback

### 数据解析流程

```typescript
function parseData(raw: unknown): DataType | null {
  // 1. 如果是字符串，先尝试 JSON 解析
  let data = raw
  if (typeof raw === 'string') {
    try {
      data = JSON.parse(raw)
    } catch {
      console.error('JSON 解析失败')
      return null
    }
  }

  // 2. 验证数据格式：必须是 JSON 对象，不支持数组
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    console.warn('数据格式错误，期望 JSON 对象')
    return null
  }

  // 3. 验证必需字段
  // ...

  // 4. 返回解析后的数据
  return data as DataType
}
```

## 事件格式

### 发送到 Android 的事件格式

所有事件都通过 `send(eventName, data)` 发送，最终格式为：

```json
{
  "event": "cardClick",
  "data": {
    "pageId": "vital-overview",
    "cardType": "heart-rate",
    "data": { ... }
  },
  "pageId": "vital-overview",
  "timestamp": 1234567890
}
```

### 常见事件类型

- `pageReady` - 页面初始化完成（自动发送）
- `dataReceived` - 数据接收成功（自动发送）
- `cardClick` - 卡片点击事件
- `viewAll` - 查看更多事件
- `requestData` - 请求原生发送数据

## 调试

### 开发环境调试

所有组件在开发环境下会显示调试信息：

```tsx
{import.meta.env.DEV && (
  <div className="mt-4 text-xs text-gray-400 text-center">
    NativeBridge Ready: {isReady ? '✅' : '⏳'}
  </div>
)}
```

### 日志输出

启用 `debug: true` 后，`useNativeBridge` 会输出详细日志：

```
[NativeBridge][vital-overview][INFO] 初始化通信层
[NativeBridge][vital-overview][INFO] 收到原生数据 {...}
[NativeBridge][vital-overview][INFO] 解析后的数据： {...}
[NativeBridge][vital-overview][INFO] 发送事件: cardClick {...}
```

## 实现细节

### NativeBridge 全局对象

`useNativeBridge` hook 会在 `window.NativeBridge` 上创建全局对象：

```typescript
window.NativeBridge = {
  version: '2.0.0',
  debug: boolean,
  receiveData: (payload: string | object) => void,
  _onDataReceived: ((data: unknown) => void) | null,
  _onError: ((error: NativeBridgeError) => void) | null
}
```

### Android 注入对象

Android 端需要注入 `window.android` 对象：

```typescript
window.android = {
  onJsMessage: (payload: string) => void
}
```

## 注意事项

1. **数据格式验证**：所有组件都会验证数据格式，不符合要求时使用默认数据
2. **边界值处理**：所有数值都有边界限制，防止 UI 溢出
3. **文本截断**：长文本会自动截断，防止布局溢出
4. **错误处理**：JSON 解析失败、数据格式错误等情况都有 fallback 机制
5. **性能优化**：限制数组长度（如音乐卡片最多 10 个）、使用 `useMemo` 优化渲染

## 参考

- Hook 实现: `src/hooks/useNativeBridge.ts`
- 组件示例: `src/pages/widget/dialog/Type5_VitalOverviewWidgetPage.tsx`（所有 Widget 页面命名规范: `TypeN_NameWidgetPage.tsx`）
- 原生桥接规范: `report/ANDROID_NATIVE_BRIDGE_SPEC.md`