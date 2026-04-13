module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Zen Garden palette
        zen: {
          50:  "#f6f7f4",   // lightest sand
          100: "#edeee8",   // warm sand
          200: "#dddecf",   // dry sand
          300: "#c4c5aa",   // light bamboo
          400: "#a3a67e",   // bamboo
          500: "#7d8060",   // sage
          600: "#636845",   // moss
          700: "#4d5137",   // deep moss
          800: "#3a3d2b",   // stone dark
          900: "#2a2d1f",   // deepest earth
          950: "#1a1c14",   // night garden
        },
        stone: {
          50:  "#faf9f7",
          100: "#f0eeea",
          200: "#e2ddd6",
          300: "#cfc7bb",
          400: "#b5a999",
          500: "#9a8d7d",
          600: "#7f7264",
          700: "#655a4e",
          800: "#4d4439",
          900: "#3a332b",
        },
        moss: {
          50:  "#f2f5f0",
          100: "#e0e7db",
          200: "#c1cfb7",
          300: "#9bb28d",
          400: "#7a9668",
          500: "#5e7a4e",
          600: "#4a623d",
          700: "#3b4e31",
          800: "#2e3d27",
          900: "#243020",
        },
        water: {
          50:  "#f0f7f7",
          100: "#dceeed",
          200: "#b8ddd9",
          300: "#8ac4bf",
          400: "#5da8a2",
          500: "#438d87",
          600: "#36726d",
          700: "#2d5b57",
          800: "#264947",
          900: "#1f3b39",
        },
        primary: "#5e7a4e",
        success: "#4a623d",
        error: "#9b4d4d",
        warning: "#b5894a",
      },
      fontFamily: {
        sans: ['"Inter"', '"Noto Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'zen': '0.75rem',
      },
      boxShadow: {
        'zen': '0 1px 3px rgba(42, 45, 31, 0.08), 0 1px 2px rgba(42, 45, 31, 0.06)',
        'zen-md': '0 4px 6px rgba(42, 45, 31, 0.07), 0 2px 4px rgba(42, 45, 31, 0.06)',
        'zen-lg': '0 10px 15px rgba(42, 45, 31, 0.07), 0 4px 6px rgba(42, 45, 31, 0.05)',
      },
    },
  },
  plugins: [],
};
