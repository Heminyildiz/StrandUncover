/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        comfortaa: ["Comfortaa", "cursive"]
      },
      colors: {
        brandPrimary: "#8B5CF6",    // Mor
        brandSecondary: "#EC4899",  // Pembe
        brandAccent: "#FBBF24",     // Turuncu
        brandLight: "#F3F4F6",      // Açık Gri
        brandGreen: "#34D399",      // Yeşil
        brandRed: "#EF4444",        // Kırmızı

        // Yeni gradient tonlar
        brandGradientFrom: "#F472B6", // Pembe ton
        brandGradientTo: "#A78BFA"    // Açık Mor
      }
    },
  },
  plugins: [],
};





