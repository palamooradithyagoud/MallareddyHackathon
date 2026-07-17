/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "#080415",
        surface: "#100b26",
        border: "#261d47",
        primary: {
          DEFAULT: "#6366f1", // Indigo
          hover: "#4f46e5",
        },
        secondary: {
          DEFAULT: "#a855f7", // Purple
          hover: "#9333ea",
        },
        accent: {
          DEFAULT: "#06b6d4", // Cyan
        },
        text: {
          primary: "#f3f4f6",
          secondary: "#9ca3af",
          muted: "#6b7280",
        }
      },
      backgroundImage: {
        'gradient-main': 'radial-gradient(circle at top left, #1a0f3d 0%, #080415 60%)',
        'gradient-card': 'linear-gradient(135deg, rgba(26, 17, 59, 0.4) 0%, rgba(13, 8, 33, 0.6) 100%)',
        'gradient-button': 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)',
        'gradient-button-hover': 'linear-gradient(90deg, #4f46e5 0%, #9333ea 100%)',
      },
      boxShadow: {
        'glow-primary': '0 0 15px rgba(99, 102, 241, 0.4)',
        'glow-secondary': '0 0 15px rgba(168, 85, 247, 0.4)',
        'glow-accent': '0 0 15px rgba(6, 182, 212, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
