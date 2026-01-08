# 移动端日期切换滑动组件规划

## 目标
实现手机端左右滑动切换日期的UI布局组件，提升移动端用户体验。

---

## 1. 需求分析

### 核心功能需求
- ✅ 左右滑动手势支持切换日期（上一天/下一天）
- ✅ 日期显示清晰，支持多种格式（如 "2024-01-07"、"1月7日" 等）
- ✅ 禁用不可用日期的操作（如禁用未来日期的next操作）
- ✅ 指示器显示当前位置
- ✅ 平滑的动画过渡
- ✅ 响应式设计，完美适配移动设备

### 应用场景
- 日报页面（/daily/healthy、/daily/emotion、/daily/sleep）
- 详情页面（/details/血压等）
- Widget页面（趋势展示）

---

## 2. 组件设计方案

### 2.1 新建组件：DateSwipeContainer
**文件路径**: `src/components/ui/DateSwipeContainer.tsx`

#### 功能特性
- 基于 SwipeableCarousel 的滑动容器逻辑
- 渲染日期视图和数据内容
- 触摸事件处理
- 日期范围限制

#### Props接口设计
```tsx
interface DateSwipeContainerProps {
  // 核心日期配置
  currentDate: Date
  onDateChange: (date: Date) => void
  minDate?: Date  // 最早可选日期
  maxDate?: Date  // 最晚可选日期（通常为今天）
  
  // 内容渲染
  renderContent: (date: Date) => ReactNode
  dateFormat?: (date: Date) => string  // 自定义日期格式函数
  
  // 样式相关
  className?: string
  containerClassName?: string
  headerClassName?: string
  dateDisplayClassName?: string
  
  // 行为配置
  enableSwipe?: boolean  // 是否启用滑动
  smoothScroll?: boolean  // 是否启用平滑滚动
  isLoading?: boolean  // 数据加载状态
  
  // 回调事件
  onSwipeStart?: () => void
  onSwipeEnd?: () => void
}
```

#### 内部状态管理
- currentDate: 当前显示的日期
- 滑动开始/结束的X坐标追踪
- 是否正在滑动的状态标志
- 动画过渡状态

#### 核心逻辑
1. **日期计算**
   - 左滑：currentDate - 1 day
   - 右滑：currentDate + 1 day
   - 边界检查：检查minDate和maxDate限制

2. **触摸事件处理**
   - touchstart: 记录起始X坐标
   - touchmove: 实时计算滑动距离，显示视觉反馈
   - touchend: 判断滑动方向和距离，触发日期变化

3. **动画效果**
   - CSS Transform实现滑动动画
   - transition实现平滑过渡
   - 考虑使用framer-motion或CSS animations

---

### 2.2 新建样式组件：DateDisplay
**文件路径**: `src/components/ui/DateDisplay.tsx`

#### 功能
- 日期的视觉呈现
- 支持多种显示格式
- 响应式调整字体大小

#### 样式特点
- Tailwind CSS实现
- 移动端优化（字体大小、间距）
- 支持深色/浅色模式

```tsx
interface DateDisplayProps {
  date: Date
  format?: (date: Date) => string
  showDayOfWeek?: boolean  // 是否显示周几
  className?: string
  direction?: 'prev' | 'next'  // 动画方向指示
}
```

---

### 2.3 修改现有组件

#### 2.3.1 DateRangePicker.tsx
**修改方案**:
- 保持现有功能不变
- 添加可选的 `mobileMode` props 切换为移动端模式
- 当 `mobileMode=true` 时，可选择性使用 DateSwipeContainer 替代
- 或者在现有结构上添加响应式判断

**新增Props**:
```tsx
interface DateRangePickerProps {
  // ... 现有props
  mobileMode?: boolean  // 激活移动端模式
  enableSwipe?: boolean  // 是否启用滑动手势
}
```

#### 2.3.2 SwipeableCarousel.tsx
**评估**:
- 已有完整的滑动逻辑和触摸事件处理
- 可复用其中的触摸事件处理逻辑
- DateSwipeContainer 可基于其逻辑进行改进

---

## 3. 实现步骤

### 第一阶段：基础组件开发
1. **创建 DateSwipeContainer.tsx**
   - 实现基础的日期滑动逻辑
   - 集成触摸事件处理
   - 日期边界检查
   - 实现 renderContent slot

2. **创建 DateDisplay.tsx**
   - 日期显示组件
   - 支持多种格式
   - 响应式样式

3. **创建 DateSwipeLayout.tsx**（可选）
   - 完整的页面布局组件
   - 包含头部、日期容器、内容区域
   - 整合加载状态和空状态处理

### 第二阶段：集成到现有页面
1. **日报页面集成**
   - /daily/healthy
   - /daily/emotion
   - /daily/sleep

2. **详情页面集成**
   - /details/血压、血糖等
   - 考虑与DateRangePicker的协作模式

3. **响应式适配**
   - 添加媒体查询，桌面端保持现有UI
   - 移动端（<768px）使用滑动模式

### 第三阶段：优化和测试
1. 性能优化
   - 虚拟滚动（如果列表过长）
   - 防抖/节流处理滑动事件
   - 懒加载数据

2. 用户体验优化
   - 滑动阻力和速度调整
   - 弹簧效果
   - 动画过渡曲线优化

3. 测试覆盖
   - 边界日期测试
   - 快速滑动测试
   - 跨浏览器兼容性测试

---

## 4. 技术选型

### 手势识别方案
- **方案A**: 原生 Touch Events（当前倾向）
  - 优点：无需额外依赖，性能好
  - 缺点：代码较复杂
  - 参考：现有 SwipeableCarousel 实现

- **方案B**: react-use-gesture 库
  - 优点：API简洁，功能丰富
  - 缺点：增加依赖
  - 如果项目已有，可考虑

- **方案C**: Hammer.js
  - 优点：功能完整，兼容性好
  - 缺点：体积较大，学习曲线

### 动画方案
- **方案A**: CSS Animations + Transforms（推荐）
  - 性能最好
  - 支持GPU加速
  - 配合 Tailwind transition utils

- **方案B**: Framer Motion
  - 如果项目已集成，可用
  - API直观，效果丰富
  - 性能相对较好

---

## 5. 数据流设计

```
ParentComponent (页面)
  ↓
DateSwipeContainer (滑动容器)
  ├─→ 日期管理逻辑
  ├─→ 触摸事件处理
  ├─→ 边界检查
  └─→ renderContent(date) 内容插槽
      ↓
    DateDisplay (日期显示)
    +
    DataContentComponent (数据内容)
```

### 事件流
```
用户触摸 → touchstart
      ↓
   touchmove (计算距离/方向)
      ↓
   touchend (判断滑动)
      ↓
触发 onDateChange → 更新 currentDate → 重新渲染内容
      ↓
   动画过渡完成
```

---

## 6. 样式设计要点

### 响应式断点
```
Mobile-first (默认移动端)
- < 768px: 滑动模式，全屏宽度
- >= 768px: 可以考虑显示按钮 + 日期选择器组合
- >= 1024px: 日期范围选择器
```

### 关键CSS类
```
.date-swipe-container     // 容器
.date-display             // 日期显示区域
.date-content             // 内容区域
.swipe-enter-active       // 进入动画
.swipe-exit-active        // 退出动画
.loading-state            // 加载状态
.disabled-state           // 禁用状态
```

---

## 7. 集成建议

### 与现有 DateRangePicker 的关系
- **保持兼容**: DateRangePicker 用于日期范围选择（周/月模式）
- **新组件用途**: DateSwipeContainer 用于单日期切换（日粒度）
- **协作方式**: 可在同一页面上共存（不同使用场景）

### 国际化支持
- 日期格式需通过 i18n 配置
- 周名称、月份名称都应该国际化
- 参考现有 `src/i18n/` 配置

---

## 8. 文件清单

### 待创建文件
1. ✅ `src/components/ui/DateSwipeContainer.tsx`
2. ✅ `src/components/ui/DateDisplay.tsx`
3. ✅ `src/components/ui/DateSwipeLayout.tsx` (可选)
4. ✅ `src/hooks/useSwipeGesture.ts` (可选，提取为hook)
5. ✅ `src/hooks/useDateNavigation.ts` (日期导航逻辑hook)

### 待修改文件
1. ✅ `src/components/business/DateRangePicker.tsx` (可选，添加响应式模式)
2. ✅ 日报页面组件 (集成DateSwipeContainer)
3. ✅ 详情页面组件 (按需集成)

---

## 9. 预期效果

### 用户体验
- 直观的滑动交互
- 快速的日期切换
- 平滑的动画过渡
- 清晰的日期提示

### 开发体验
- 高度复用的组件
- 清晰的Props接口
- 易于集成到不同页面
- 充分的自定义空间

支持日期快速跳转（弹出日历选择器）
动画可配置化
上面是需要额外添加优化的
根据方案开始修改
复用的组件可以写在ui文件夹下
