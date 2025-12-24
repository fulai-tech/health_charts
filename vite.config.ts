import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
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
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react'
            }
            if (id.includes('recharts')) {
              return 'vendor-charts'
            }
            if (id.includes('@tanstack')) {
              return 'vendor-query'
            }
            return 'vendor'
          }
        },
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
    },
  },
})
