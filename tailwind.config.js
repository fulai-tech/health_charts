/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 语义化颜色定义
        primary: "var(--color-primary)",
        bp: "#F4A261",         // 血压 - 橙色
        spo2: "#4CC9F0",       // 血氧 - 蓝色
        heartRate: "#F87171",  // 心率 - 红色
        glucose: "#E9C46A",    // 血糖 - 黄色
        card: "#FFFFFF",
        "card-bg": "#F8F9FA", // 灰色背景
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
