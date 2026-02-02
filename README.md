# Health Charts (Vital Signs Visualization)

<!-- CI/CD Status -->
![Tests](https://github.com/fulai-tech/health_charts/workflows/Tests/badge.svg)
![Build](https://github.com/fulai-tech/health_charts/workflows/Build/badge.svg)
![Code Quality](https://github.com/fulai-tech/health_charts/workflows/Code%20Quality/badge.svg)

<!-- Tech Stack -->
![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.2-646cff?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-06b6d4?logo=tailwindcss&logoColor=white)

<!-- Tools & Libraries -->
![TanStack Query](https://img.shields.io/badge/TanStack_Query-5.x-ff4154?logo=reactquery&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-3.6-8884d8)
![Vitest](https://img.shields.io/badge/Vitest-4.0-6e9f18?logo=vitest&logoColor=white)
![i18next](https://img.shields.io/badge/i18next-25.x-26a69a?logo=i18next&logoColor=white)

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

# 运行测试
yarn test           # 监听模式
yarn test:run       # 单次运行
yarn test:ui        # UI 界面
yarn test:coverage  # 覆盖率报告
```

## 🧪 测试

本项目采用轻量级测试策略，专注于高价值的核心逻辑测试：

**测试覆盖**：
- ✅ 日期工具函数（11 个测试）- 防止时间范围计算错误
- ✅ 数据适配层（13 个测试）- 防止 API 数据转换错误
- ✅ 全局状态管理（11 个测试）- 验证认证/主题/语言状态
- ✅ 工具函数（7 个测试）- 验证通用工具的正确性

**测试框架**：Vitest + Testing Library + happy-dom

详细测试指南：查看 [TEST_GUIDE.md](./TEST_GUIDE.md)

## 🔄 CI/CD

本项目配置了完整的 GitHub Actions 自动化工作流：

- ✅ **自动测试** - 每次推送和 PR 自动运行测试
- ✅ **自动构建** - 验证生产构建是否成功
- ✅ **代码质量检查** - ESLint + TypeScript + 安全扫描
- ✅ **依赖自动更新** - Dependabot 每周检查更新

详细 CI/CD 配置：查看 [.github/CI_CD_GUIDE.md](.github/CI_CD_GUIDE.md)

本地运行 CI 检查：
```bash
yarn ci  # 运行 lint + typecheck + test
```

## 🧩 架构说明

本项目采用 **Widget-First** 架构，支持两种渲染模式。

### 路由策略

| 路由模式 | 示例路径 | 布局组件 | 用途 |
|----------|----------|----------|------|
| 完整页面 | `/details/blood-pressure` | `MainLayout` | 独立访问，包含完整导航 |
| Widget 模式 | `/widget/blood-pressure/trend` | `WidgetLayout` | 原生 App iframe 嵌入，透明背景 |
| 日报页面 | `/daily/emotion` | 自定义 | 日报详情展示 |
| 周报页面 | `/weekly/report` | 自定义 | 周度健康报告 |

### URL 参数支持

- `?lang=zh` 或 `?lang=en` - 语言切换
- `?theme=light` 或 `?theme=dark` - 主题模式

## 📂 目录结构

```
src/
├── App.tsx                 # 应用入口，路由配置
├── main.tsx                # React 挂载点
├── index.css               # 全局样式（Tailwind）
│
├── pages/                  # 页面组件（路由级别）
│   ├── HomePage.tsx        # 首页/导航页
│   ├── details/            # 详情页面 (/details/:type)
│   │   ├── BloodPressurePage.tsx   # 血压详情
│   │   ├── SpO2Page.tsx            # 血氧详情
│   │   ├── HeartRatePage.tsx       # 心率详情
│   │   ├── GlucosePage.tsx         # 血糖详情
│   │   ├── SleepPage.tsx           # 睡眠详情
│   │   ├── EmotionPage.tsx         # 情绪详情
│   │   ├── NutritionPage.tsx       # 营养详情
│   │   └── HealthyPage.tsx         # 综合健康
│   ├── widget/             # Widget 页面 (/widget/:type/:component)
│   │   ├── BPTrendWidgetPage.tsx
│   │   ├── SpO2TrendWidgetPage.tsx
│   │   ├── HRTrendWidgetPage.tsx
│   │   ├── GlucoseTrendWidgetPage.tsx
│   │   └── dialog/         # 对话/弹窗类 Widget
│   │       ├── SleepScoreWidgetPage.tsx      # type-1 睡眠评分
│   │       ├── ComparisonWidgetPage.tsx      # type-2 睡眠疲劳对比
│   │       ├── NutritionIntakeWidgetPage.tsx # type-3 营养摄入
│   │       ├── MusicWidgetPage.tsx           # type-4 音乐
│   │       ├── VitalOverviewWidgetPage.tsx   # type-5 生命体征概览
│   │       └── SodiumBPWidgetPage.tsx        # type-6 钠与血压
│   ├── daily/              # 日报页面 (/daily/:type)
│   │   ├── EmotionDailyPage.tsx
│   │   ├── SleepDailyPage.tsx
│   │   └── HealthyDailyPage.tsx
│   └── weekly/             # 周报页面 (/weekly/report)
│       └── WeeklyReportPage.tsx    # 周度健康报告
│
├── modules/                # 业务功能模块（按领域/场景划分）
│   ├── features/           # 详情页功能模块
│   │   ├── blood-pressure/ # 血压
│   │   ├── spo2/           # 血氧
│   │   ├── heart-rate/     # 心率
│   │   ├── glucose/        # 血糖
│   │   ├── sleep/          # 睡眠
│   │   ├── emotion/        # 情绪
│   │   ├── nutrition/      # 营养
│   │   └── healthy/        # 综合健康
│   ├── daily/              # 日报模块
│   │   ├── emotion/        # 情绪日报
│   │   ├── sleep/          # 睡眠日报
│   │   └── healthy/        # 健康日报
│   └── weekly-report/      # 周报模块
│       ├── api.ts          # 周报 API（TanStack Query）
│       ├── adapter.ts      # 数据适配器
│       ├── types.ts
│       └── components/     # 周报卡片组件
│           ├── WROverallScoreCard.tsx      # 综合评分
│           ├── WRVitalSignsTrendCard.tsx   # 生命体征趋势
│           ├── WRAIInsightCard.tsx         # AI 洞察
│           ├── WRSleepCard.tsx             # 睡眠
│           ├── WREmotionCard.tsx            # 情绪
│           ├── WRMedicationCard.tsx        # 用药
│           ├── WRNutritionCard.tsx         # 营养
│           ├── WRExerciseCard.tsx          # 运动
│           ├── WRCorrelationCard.tsx        # 相关性
│           └── WRSuggestionCard.tsx        # 建议
│
├── components/             # 通用组件
│   ├── charts/             # 纯图表组件（无业务逻辑）
│   │   ├── VitalTrendChart.tsx       # 生命体征趋势图
│   │   ├── TrendLineChart.tsx        # 折线趋势图
│   │   ├── TimeAxisLineChart.tsx     # 时间轴折线图
│   │   ├── TimeAxisBarChart.tsx      # 时间轴柱状图
│   │   ├── StackedBarChart.tsx       # 堆叠柱状图
│   │   ├── StatisticsPieChart.tsx    # 统计饼图
│   │   ├── SleepStructureChart.tsx   # 睡眠结构图
│   │   ├── MiniGaugeChart.tsx        # 迷你仪表盘
│   │   ├── ChartClickTooltipOverlay.tsx  # 图表点击提示层
│   │   └── LazyChart.tsx             # 懒加载图表包装
│   ├── common/             # 通用业务组件
│   │   ├── SuperPanel.tsx            # 测试环境浮动控制面板
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
│   ├── layouts/            # 布局组件
│   │   ├── MainLayout.tsx  # 主布局（含导航）
│   │   └── WidgetLayout.tsx # Widget 布局（透明背景）
│   └── ui/                 # 基础 UI 组件
│       ├── card.tsx
│       ├── DisclaimerBox.tsx
│       ├── swipeable-carousel.tsx
│       ├── AuthButton.tsx
│       └── LoginDialog.tsx
│
├── services/               # 服务层
│   ├── api/                # API 相关
│   │   ├── client.ts
│   │   ├── trendService.ts
│   │   ├── dailyService.ts
│   │   ├── types.ts
│   │   └── index.ts
│   └── auth/               # 认证相关
│       ├── authService.ts
│       ├── types.ts
│       └── index.ts
│
├── hooks/                  # 自定义 Hooks
│   ├── useUrlParams.ts         # URL 参数解析
│   ├── useWeekNavigation.ts    # 周导航逻辑
│   ├── useSwipeNavigation.ts   # 滑动导航
│   ├── useDailyData.ts         # 日数据获取
│   ├── useChartAnimation.ts    # 图表动画
│   ├── useInViewport.ts        # 视口检测
│   ├── useHideTooltipOnScroll.ts # 滚动隐藏提示
│   ├── useNativeBridge.ts      # 原生桥接
│   ├── useTheme.ts             # 主题
│   └── useTokenValidation.ts   # Token 校验
│
├── config/                 # 配置文件
│   ├── theme.ts            # 主题配置（颜色常量）
│   ├── chartConfig.ts      # 图表配置
│   ├── api.ts              # API 配置
│   ├── config.ts           # 通用配置
│   └── globalDemoMode.ts   # 全局演示模式
│
├── lib/                    # 工具函数
│   ├── utils.ts
│   ├── dateUtils.ts
│   └── usePrefetchData.ts
│
├── i18n/                   # 国际化
│   ├── index.ts
│   └── locales/
│       ├── zh.json
│       └── en.json
│
└── assets/                 # 静态资源
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
| weekly-report | WR |

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

1. 在 `src/modules/` 下创建模块目录（如 `features/xxx`、`daily/xxx` 或独立模块如 `weekly-report`）
2. 创建 `types.ts` 定义 TypeScript 接口
3. 创建 `adapter.ts` 实现数据转换
4. 创建 `api.ts` 封装 TanStack Query hooks
5. 在模块内 `components/` 下创建功能组件
6. 在 `src/pages/` 下创建对应页面（如 `details/`、`daily/`、`weekly/`、`widget/`）
7. 在 `App.tsx` 中添加路由

### 代码规范

- **样式**：使用 Tailwind CSS，条件类名使用 `clsx` + `tailwind-merge`
- **导入**：使用 `@/` 路径别名
- **组件**：纯函数组件，使用 hooks 管理状态
- **国际化**：所有文本使用 `useTranslation` hook

## 📄 License

Private Project
