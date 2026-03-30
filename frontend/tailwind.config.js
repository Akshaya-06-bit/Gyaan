module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        ink: "#0f5f66",
        paper: "#ffffff",
        fog: "#f4fbfb",
        mist: "#e4f2f1",
        smoke: "#cfe7e5",
        accent: "#5fd4ce",
        accentSoft: "#9fe7e3",
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "Noto Sans",
          "Liberation Sans",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 18px 40px -26px rgba(15,95,102,0.35)",
      },
      borderRadius: {
        "2xl": "1rem",
      },
    },
  },
  plugins: [],
};
