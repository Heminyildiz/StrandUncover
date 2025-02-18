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
        brandPrimary: "#8B5CF6",    // mor 
        brandSecondary: "#EC4899",  // pembe
        brandAccent: "#FBBF24",     // turuncu ton
        brandLight: "#F3F4F6",      // açık gri
        brandGreen: "#34D399"       // yeşil
      }
    },
  },
  plugins: [],
};



