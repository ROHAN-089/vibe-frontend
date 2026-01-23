/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        discord: {
          bg: '#313338',     // Dark Chat Background
          sidebar: '#2B2D31', // Darker Sidebar/Header
          element: '#383A40', // Message/Input Background
          hover: '#404249',   // Hover State
          divider: '#1E1F22', // Lines/Borders
          text: '#DBDEE1',    // Primary Text
          muted: '#949BA4',   // Secondary Text
          brand: '#5865F2',   // Blurple
          green: '#23A559',
          red: '#DA373C',
          yellow: '#F0B232',
        },
        // New Vibe Branding Colors
        "primary": "#7C3AED",
        "electric-blue": "#00F5FF",
        "vibrant-purple": "#8A2BE2",
        "midnight": "#0B0E14",
        "deep-charcoal": "#12141D",
      },
      fontFamily: {
        "display": ["Plus Jakarta Sans", "sans-serif"],
      },
      borderRadius: {
        "lg": "2rem",
        "xl": "3rem",
      },
      boxShadow: {
        'neon-pink': '0 0 20px rgba(208, 0, 247, 0.6), 0 0 40px rgba(208, 0, 247, 0.2)',
        'neon-blue': '0 0 20px rgba(0, 245, 255, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
