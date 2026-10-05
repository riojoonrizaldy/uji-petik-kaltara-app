/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        telkom: {
          red: '#ED1D24',
          darkRed: '#C41218',
          gray: '#333333'
        }
      }
    },
  },
  plugins: [],
}
