import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6",
        secondary: "#6B7280",
        success: "#10B981",
        error: "#EF4444",
        // v2 gradient colors
        'gradient-start': '#3B82F6',
        'gradient-end': '#6366F1',
        // glassmorphism colors
        'glass-bg': 'rgba(255, 255, 255, 0.1)',
        'glass-border': 'rgba(255, 255, 255, 0.2)',
      },
      backgroundImage: {
        'header-gradient': 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      spacing: {
        '18': '4.5rem',
      },
    },
  },
  plugins: [],
};
export default config;
