/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 50:"#fff1f2",100:"#ffe1e4",200:"#ffc7cd",300:"#ff9aa5",400:"#fb5c6e",500:"#f0283c",600:"#e3112d",700:"#bf0b25",800:"#96091d",900:"#6e0716" },
        surface: "#f3f4f6",
        ink: { DEFAULT: "#1f2937", soft: "#6b7280" },
      },
      fontFamily: { sans: ["Hind Siliguri", "Inter", "system-ui", "sans-serif"] },
      boxShadow: { card: "0 1px 2px rgba(16,24,40,.04), 0 4px 16px rgba(16,24,40,.06)", float: "0 10px 30px rgba(227,17,45,.28)" },
      borderRadius: { xl2: "1.25rem" },
    },
  },
  plugins: [],
};
