/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Pastel renkler
        "pastel-50": "#fefcfb",
        "pastel-100": "#fcf7f2",
        "pastel-200": "#f9efe5",
        "pastel-300": "#f4e3d4",
        "pastel-400": "#eedac6",
        "pastel-500": "#e6cdb3",
        "pastel-600": "#ddbfa1",
        "pastel-700": "#d2ae8c",
        "pastel-800": "#c79d78",
        "pastel-900": "#b78259",
      },
    },
  },
  plugins: [],
};
