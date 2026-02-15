/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        method: {
          get: '#10b981',    // green-500
          post: '#3b82f6',   // blue-500
          put: '#f97316',    // orange-500
          patch: '#a855f7',  // purple-500
          delete: '#ef4444', // red-500
        },
      },
    },
  },
  plugins: [],
}
