/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // 确保包含所有组件文件
  ],
  theme: {
    extend: {
      borderRadius: {
        xl: "1rem", // 自定义圆角值
      },
      colors: {
        "custom-blue": "#1a365d", // 自定义颜色
      }
    },
  },
  plugins: [],
}