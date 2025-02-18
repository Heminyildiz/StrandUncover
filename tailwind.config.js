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
        brandPrimary: "#8B5CF6",    // Mor 
        brandSecondary: "#EC4899",  // Pembe
        brandAccent: "#FBBF24",     // Turuncu
        brandLight: "#F3F4F6",      // Açık Gri
        brandGreen: "#34D399",      // Yeşil
        brandRed: "#EF4444"         // Kırmızı
      }
    },
  },
  plugins: [],
};




