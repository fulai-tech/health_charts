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
      // 针对腾讯 X5 内核优化（基于 Chromium 83+）
      // X5 4.x 内核已支持大部分 ES2020 特性，无需额外 polyfill
      targets: ['chrome 83'],
      // 关闭现代浏览器 polyfill，X5 83+ 不需要
      modernPolyfills: false,
      // 保留 legacy chunks 以防万一有更老的 WebView
      renderLegacyChunks: true,
      // 移除不必要的 polyfills，Chrome 83 已原生支持这些特性
      polyfills: false,
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
