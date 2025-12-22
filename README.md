# Health Charts (Vital Signs Visualization)

基于 React + Vite + TypeScript 的高性能健康数据可视化组件库。
专为移动端 WebView 嵌入设计，支持组件级独立渲染。

## 🏗 技术栈
- **Core**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, Radix UI (Headless)
- **Charts**: Recharts
- **State/Data**: TanStack Query, Axios
- **I18n**: i18next (前端处理所有多语言逻辑)

## 🚀 快速开始
1. `npm install`
2. `npm run dev`

## 🧩 架构说明
本项目采用 **Widget-First** 架构：
- **完整页面模式**: `/details/blood-pressure` (包含导航、完整分析)
- **嵌入模式**: `/widget/blood-pressure/trend` (仅渲染图表，用于原生 App 嵌入)

## 📂 目录规范
- `src/components/charts`: 纯图表组件，不含业务逻辑
- `src/features`: 业务逻辑模块 (包含 API 请求和数据转换适配器)