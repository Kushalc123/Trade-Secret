/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
      "./src/**/*.{js,ts,jsx,tsx,mdx}"
    ],
    theme: {
      extend: {
        colors: {
          brand: {
            DEFAULT: "#6366F1",
            light:  "#7C3AED"
          }
        }
      }
    },
    plugins: []
  }
  