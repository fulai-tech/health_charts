export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
    // 添加 CSS 降级，兼容老版本 Android WebView
    ...(process.env.NODE_ENV === 'production' ? {
      'postcss-preset-env': {
        stage: 2,
        features: {
          'nesting-rules': true,
          'custom-properties': true,
          'color-mix': true,
        },
        browsers: ['chrome >= 61', 'android >= 5'],
      },
    } : {}),
  },
}
