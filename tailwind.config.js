/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        lexend: ["Lexend", "sans-serif"],
      },
      colors: {
        "pastel-100": "#E3F2FD", 
        "pastel-200": "#FFF9C4", 
        "pastel-300": "#FFE0B2", 
        "pastel-400": "#FFCDD2", 
        "pastel-500": "#D1C4E9",
      }
    },
  },
  plugins: [],
};


