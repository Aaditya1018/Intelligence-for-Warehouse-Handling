/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        warehouse: {
          dark: '#0B0F19',
          card: '#111827',
          panel: '#1E293B',
          accent: '#3B82F6',
          warning: '#F59E0B',
          danger: '#EF4444',
          success: '#10B981',
          cyan: '#06B6D4',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
