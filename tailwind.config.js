module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Zen Garden — natural, muted, grounded
        sand: {
          50:  "#FDFCF9",
          100: "#FAF9F6",  // warm off-white (background)
          200: "#F5F1E8",  // soft sand (primary surface)
          300: "#EDE8DA",
          400: "#E0D8C5",
          500: "#CFC4A8",
          600: "#B5A88A",
          700: "#9A8D72",
          800: "#7A7059",
          900: "#5C5443",
        },
        sage: {
          50:  "#F4F7F0",
          100: "#E8EFE0",
          200: "#D3E0C5",
          300: "#B8CCA3",
          400: "#A3B18A",  // sage green (secondary)
          500: "#8A9C72",
          600: "#6B8F71",  // muted olive (secondary accent)
          700: "#5A7A5E",
          800: "#47614A",
          900: "#344E41",  // deep forest green (accent)
        },
        earth: {
          50:  "#F7F6F5",
          100: "#EEECEB",
          200: "#E0DCDA",
          300: "#CCC6C2",
          400: "#B0A8A2",
          500: "#948A82",
          600: "#786E66",
          700: "#5C544D",
          800: "#3E3936",
          900: "#2F2F2F",  // soft charcoal (text)
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'display': ['2.5rem', { lineHeight: '1.2', fontWeight: '300' }],
        'heading': ['1.75rem', { lineHeight: '1.3', fontWeight: '300' }],
        'subheading': ['1.125rem', { lineHeight: '1.5', fontWeight: '400' }],
      },
      borderRadius: {
        'zen': '1rem',
        'zen-lg': '1.25rem',
      },
      boxShadow: {
        'zen': '0 1px 3px rgba(47, 47, 47, 0.04), 0 1px 2px rgba(47, 47, 47, 0.03)',
        'zen-md': '0 4px 12px rgba(47, 47, 47, 0.05), 0 1px 3px rgba(47, 47, 47, 0.03)',
        'zen-lg': '0 8px 24px rgba(47, 47, 47, 0.06), 0 2px 6px rgba(47, 47, 47, 0.03)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      transitionDuration: {
        '350': '350ms',
      },
    },
  },
  plugins: [],
};
