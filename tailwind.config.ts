import type { Config } from "tailwindcss";

// made by al with love
export default {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#16261F",        // teks utama, hijau tua kehitaman
        deep: "#0F3D33",       // sidebar / brand primer, teal tua institusional
        deep2: "#155345",
        sand: "#F5F1E8",       // background hangat, bukan cream generik terang
        paper: "#FBFAF6",
        amber: "#C97A2B",      // aksen status "diproses" / peringatan
        rust: "#B4432E",       // aksen status "ditolak"
        moss: "#3F7B57",       // aksen status "selesai"
        line: "#DDD6C4",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
      },
      keyframes: {
        fadeSlideIn: {
          "0%": { opacity: "0", transform: "translateX(28px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        fadeSlideIn: "fadeSlideIn 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [],
} satisfies Config;
