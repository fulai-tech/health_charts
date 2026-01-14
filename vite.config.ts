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
      // 兼容老版本 Android 原生 WebView（基于 Chrome 61+）
      // 以及腾讯 X5 内核（Chromium 83+）
      targets: ['chrome >= 61', 'android >= 5'],
      // 启用现代浏览器 polyfill 以防万一
      modernPolyfills: true,
      // 保留 legacy chunks 支持老 WebView
      renderLegacyChunks: true,
      // 添加必要的 polyfills
      polyfills: true,
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
    proxy: {
      '/nutrition': {
        target: 'http://43.138.100.224:5001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'docs',
    // 降低 CSS 目标版本，兼容老版本 Android WebView
    cssTarget: 'chrome61',
    // 降低 JS 目标版本
    target: 'chrome61',
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
            // 其他第三方
            return 'vendor'
          }
        },
      },
    },
  },
})
