import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
import path from 'path'
import viteCompression from 'vite-plugin-compression'
import viteImagemin from 'vite-plugin-imagemin'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    legacy({
      // 针对 Chromium 63-80 的兼容性（华为 WebView 83 基于 Chromium 83）
      targets: ['chrome 63', 'safari 11.1', 'ios 11.3', 'android 67'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      modernPolyfills: true,
      renderLegacyChunks: true,
      polyfills: [
        'es.promise.finally',
        'es/global-this',
        'es.array.flat',
        'es.array.flat-map',
        'es.object.from-entries',
        'es.string.match-all'
      ],
    }),
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz',
    }),
    viteImagemin({
      gifsicle: { optimizationLevel: 7, interlaced: false },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      pngquant: { quality: [0.7, 0.9], speed: 3 },
      svgo: { plugins: [{ name: 'removeViewBox' }, { name: 'removeEmptyAttrs', active: false }] },
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',  // 监听所有网络接口，接受局域网请求
    port: 5174,
  },
  build: {
    outDir: 'docs',
    cssTarget: 'chrome80',
    modulePreload: {
      polyfill: true,
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        // 确保每次构建基于内容生成不同的哈希文件名
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // 手动分包以优化缓存
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // React 核心
            if (id.includes('react-dom')) {
              return 'vendor-react-dom'
            }
            if (id.includes('/react/') || id.includes('/react-is/')) {
              return 'vendor-react'
            }
            // 图表库单独分包
            if (id.includes('recharts')) {
              return 'vendor-charts'
            }
            // d3 图表依赖
            if (id.includes('d3-')) {
              return 'vendor-d3'
            }
            // ECharts 单独分包（如果使用）
            if (id.includes('echarts')) {
              return 'vendor-echarts'
            }
            // 状态管理
            if (id.includes('@tanstack')) {
              return 'vendor-query'
            }
            // 路由
            if (id.includes('react-router')) {
              return 'vendor-router'
            }
            // i18n
            if (id.includes('i18next')) {
              return 'vendor-i18n'
            }
            // 其他第三方
            return 'vendor'
          }
        },
      },
    },
  },
})
