import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        // LoadingPage.tsx 関連
        cubemove: {
          "25%": {
            transform: "translateX(42px) rotate(-90deg) scale(0.5)",
          },
          "50%": {
            transform: "translateX(42px) translateY(42px) rotate(-179deg)",
          },
          "50.1%": {
            transform: "translateX(42px) translateY(42px) rotate(-180deg)",
          },
          "75%": {
            transform:
              "translateX(0px) translateY(42px) rotate(-270deg) scale(0.5)",
          },
          "100%": {
            transform: "rotate(-360deg)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        // LoadingPage.tsx 関連
        cube: "cubemove 1.8s infinite ease-in-out",
        "cube-delayed": "cubemove 1.8s infinite ease-in-out -0.9s",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("tailwindcss-animated")],
} satisfies Config;

export default config;
