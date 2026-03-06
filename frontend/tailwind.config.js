/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          500: "#38bdf8",
          600: "#0ea5e9"
        }
      }
    }
  },
  plugins: []
};

