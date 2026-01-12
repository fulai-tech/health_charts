# Health Charts (Vital Signs Visualization)

基于 React + Vite + TypeScript 的高性能健康数据可视化组件库。
专为移动端 WebView 嵌入设计，支持组件级独立渲染。

## 🏗 技术栈

| 分类 | 技术 | 版本 |
|------|------|------|
| **Core** | React | 18.x |
| | TypeScript | ~5.9 |
| | Vite (rolldown-vite) | 7.2.5 |
| **UI** | Tailwind CSS | 4.x |
| | Radix UI (Headless) | - |
| | Lucide React (Icons) | - |
| **Charts** | Recharts | 3.6.x |
| | ECharts | 6.x |
| **State/Data** | TanStack Query | 5.x |
| | Axios | 1.x |
| **I18n** | i18next | 25.x |
| **Utils** | dayjs | 1.11.x |
| | clsx + tailwind-merge | - |

## 🚀 快速开始

```bash
# 安装依赖
yarn

# 开发模式
yarn dev 
或 
yarn d

# 构建生产版本
yarn build
或
yarn b

```

## 🧩 架构说明

本项目采用 **Widget-First** 架构，支持两种渲染模式：

### 路由策略

| 路由模式 | 示例路径 | 布局组件 | 用途 |
|----------|----------|----------|------|
| 完整页面 | `/details/blood-pressure` | `MainLayout` | 独立访问，包含完整导航 |
| Widget 模式 | `/widget/blood-pressure/trend` | `WidgetLayout` | 原生 App iframe 嵌入，透明背景 |
| 日报页面 | `/daily/emotion` | 自定义 | 日报详情展示 |

### URL 参数支持

- `?lang=zh` 或 `?lang=en` - 语言切换
- `?theme=light` 或 `?theme=dark` - 主题模式

## 📂 目录结构

```
src/
├── App.tsx                 # 应用入口，路由配置
├── main.tsx               # React 挂载点
├── index.css              # 全局样式（Tailwind）
│
├── pages/                 # 页面组件（路由级别）
│   ├── HomePage.tsx       # 首页/导航页
│   ├── details/           # 详情页面 (/details/:type)
│   │   ├── BloodPressurePage.tsx   # 血压详情
│   │   ├── SpO2Page.tsx            # 血氧详情
│   │   ├── HeartRatePage.tsx       # 心率详情
│   │   ├── GlucosePage.tsx         # 血糖详情
│   │   ├── SleepPage.tsx           # 睡眠详情
│   │   ├── EmotionPage.tsx         # 情绪详情
│   │   ├── NutritionPage.tsx       # 营养详情
│   │   └── HealthyPage.tsx         # 综合健康
│   ├── widget/            # Widget 页面 (/widget/:type/:component)
│   │   ├── BPTrendWidgetPage.tsx
│   │   ├── SpO2TrendWidgetPage.tsx
│   │   ├── HRTrendWidgetPage.tsx
│   │   └── GlucoseTrendWidgetPage.tsx
│   └── daily/             # 日报页面 (/daily/:type)
│       ├── EmotionDailyPage.tsx
│       ├── SleepDailyPage.tsx
│       └── HealthyDailyPage.tsx
│
├── features/              # 业务功能模块（按领域划分）
│   ├── blood-pressure/    # 血压模块
│   │   ├── api.ts         # API 请求（TanStack Query hooks）
│   │   ├── adapter.ts     # 数据适配器（后端→前端转换）
│   │   ├── types.ts       # TypeScript 类型定义
│   │   ├── index.ts       # 模块导出
│   │   └── components/    # 功能组件
│   │       ├── BPStatisticsCard.tsx    # 统计卡片
│   │       ├── BPTrendyReportCard.tsx  # 趋势报告
│   │       ├── BPWeeklyOverviewCard.tsx # 周概览
│   │       ├── BPCompareCard.tsx       # 对比卡片
│   │       ├── BPSummaryCard.tsx       # 摘要卡片
│   │       └── BPTrendWidget.tsx       # Widget 组件
│   ├── spo2/              # 血氧模块
│   ├── heart-rate/        # 心率模块
│   ├── glucose/           # 血糖模块
│   ├── sleep/             # 睡眠模块
│   ├── emotion/           # 情绪模块
│   ├── nutrition/         # 营养模块
│   └── healthy/           # 综合健康模块
│
├── components/            # 通用组件
│   ├── charts/            # 纯图表组件（无业务逻辑）
│   │   ├── VitalTrendChart.tsx       # 生命体征趋势图
│   │   ├── TrendLineChart.tsx        # 折线趋势图
│   │   ├── TimeAxisLineChart.tsx     # 时间轴折线图
│   │   ├── TimeAxisBarChart.tsx      # 时间轴柱状图
│   │   ├── StackedBarChart.tsx       # 堆叠柱状图
│   │   ├── StatisticsPieChart.tsx    # 统计饼图
│   │   ├── SleepStructureChart.tsx   # 睡眠结构图
│   │   └── LazyChart.tsx             # 懒加载图表包装
│   ├── common/            # 通用业务组件
│   │   ├── DistributionCard.tsx      # 分布卡片
│   │   ├── TargetBarChartCard.tsx    # 目标柱状图卡片
│   │   ├── DataAnalysisCard.tsx      # 数据分析卡片
│   │   ├── WeeklyOverviewCard.tsx    # 周概览卡片
│   │   ├── MetricSummaryCard.tsx     # 指标摘要卡片
│   │   ├── AIInsightsCard.tsx        # AI 洞察卡片
│   │   ├── DailyScoreCard.tsx        # 日评分卡片
│   │   ├── DateRangePicker.tsx       # 日期范围选择器
│   │   ├── EmptyState.tsx            # 空状态组件
│   │   ├── EmotionFaceIcon.tsx       # 情绪表情图标
│   │   └── SuggestionsList.tsx       # 建议列表
│   └── ui/                # 基础 UI 组件
│       ├── card.tsx                  # 卡片组件
│       ├── DisclaimerBox.tsx         # 免责声明
│       └── swipeable-carousel.tsx    # 滑动轮播
│
├── layouts/               # 布局组件
│   ├── MainLayout.tsx     # 主布局（含导航）
│   └── WidgetLayout.tsx   # Widget 布局（透明背景）
│
├── services/              # 服务层
│   ├── api/               # API 相关
│   │   ├── client.ts      # Axios 实例配置
│   │   ├── trendService.ts # 趋势数据服务
│   │   ├── dailyService.ts # 日报数据服务
│   │   ├── types.ts       # API 类型定义
│   │   └── index.ts       # 导出
│   └── auth/              # 认证相关
│       ├── authService.ts # 认证服务
│       ├── types.ts       # 认证类型
│       └── index.ts       # 导出
│
├── hooks/                 # 自定义 Hooks
│   ├── useUrlParams.ts         # URL 参数解析
│   ├── useWeekNavigation.ts    # 周导航逻辑
│   ├── useSwipeNavigation.ts   # 滑动导航
│   ├── useDailyData.ts         # 日数据获取
│   ├── useChartAnimation.ts    # 图表动画
│   ├── useInViewport.ts        # 视口检测
│   └── useHideTooltipOnScroll.ts # 滚动隐藏提示
│
├── config/                # 配置文件
│   ├── theme.ts           # 主题配置（颜色常量）
│   ├── chartConfig.ts     # 图表配置
│   └── api.ts             # API 配置
│
├── lib/                   # 工具函数
│   ├── utils.ts           # 通用工具（cn 函数等）
│   ├── dateUtils.ts       # 日期处理工具
│   └── usePrefetchData.ts # 预加载数据
│
├── i18n/                  # 国际化
│   ├── index.ts           # i18next 配置
│   └── locales/           # 语言文件
│       ├── zh.json        # 中文
│       └── en.json        # 英文
│
└── assets/                # 静态资源
```

## 🎨 设计规范

### 组件命名约定

| 组件类型 | 命名格式 | 示例 |
|----------|----------|------|
| 统计卡片 | `[Feature]StatisticsCard` | `HRStatisticsCard` |
| 数据分析 | `[Feature]DataAnalysisCard` | `NutritionDataAnalysisCard` |
| 周概览 | `[Feature]WeeklyOverviewCard` | `SleepWeeklyOverviewCard` |
| 趋势报告 | `[Feature]TrendyReportCard` | `BPTrendyReportCard` |
| Widget | `[Feature]TrendWidget` | `SpO2TrendWidget` |

### Feature 前缀对照表

| 模块 | 前缀 |
|------|------|
| heart-rate | HR |
| blood-pressure | BP |
| spo2 | SpO2 |
| glucose | Glucose |
| sleep | Sleep |
| emotion | Emotion |
| nutrition | Nutrition |

### 颜色配置

所有颜色统一在 `src/config/theme.ts` 中定义：

```typescript
// 生命体征主题色
VITAL_COLORS = {
  bp: 'rgb(244, 162, 97)',        // 血压 - 橙色
  spo2: 'rgb(76, 201, 240)',      // 血氧 - 青蓝色
  heartRate: 'rgb(248, 113, 113)', // 心率 - 红色
  glucose: 'rgb(233, 196, 106)',   // 血糖 - 金色
  sleep: 'rgb(167, 139, 250)',     // 睡眠 - 紫色
  nutrition: 'rgb(251, 146, 61)',  // 营养 - 橙色
}
```

## 🔄 数据流架构

### Adapter Pattern（适配器模式）

后端 API 返回中文标签数据，前端通过 Adapter 转换为标准化的领域模型：

```
Backend API (Chinese Labels) 
    ↓
adapter.ts (转换层)
    ↓
Domain Model (Translation Keys)
    ↓
UI Components (i18n 渲染)
```

**核心原则：**
- ❌ **禁止** 直接在 UI 中显示后端返回的 `label` 字符串
- ✅ **必须** 通过 `adapter.ts` 映射为 i18n 翻译 key
- ✅ 日期使用 `dayjs` 格式化，支持多语言

### 数据请求流程

```typescript
// 1. API Hook (TanStack Query)
const { data, isLoading } = useBPTrendData(dateRange)

// 2. API 请求 → 自动调用 adapter
// api.ts 中:
const response = await apiClient.post('/trend', params)
return adaptBPData(response.data) // 转换为前端模型

// 3. 组件直接使用转换后的数据
<BPTrendyReportCard data={data} />
```

## 📱 Widget 嵌入说明

### 基本用法

```html
<iframe 
  src="https://your-domain.com/#/widget/blood-pressure/trend?lang=zh" 
  style="border: none; width: 100%; height: 300px;"
></iframe>
```

### Widget 特点
- 透明背景，无边距
- 独立渲染，不含导航
- 支持 URL 参数配置语言和主题

## 🛠 开发指南

### 新增功能模块

1. 在 `src/features/` 下创建模块目录
2. 创建 `types.ts` 定义 TypeScript 接口
3. 创建 `adapter.ts` 实现数据转换
4. 创建 `api.ts` 封装 TanStack Query hooks
5. 在 `components/` 下创建功能组件
6. 在 `src/pages/` 下创建页面组件
7. 在 `App.tsx` 中添加路由

### 代码规范

- **样式**：使用 Tailwind CSS，条件类名使用 `clsx` + `tailwind-merge`
- **导入**：使用 `@/` 路径别名
- **组件**：纯函数组件，使用 hooks 管理状态
- **国际化**：所有文本使用 `useTranslation` hook

## 📄 License

Private Project
