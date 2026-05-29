/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 60-30-10 Design Rule: Neutral base (60%), Secondary (30%), Accent (10%)
        // Primary: Deep Indigo (Base - 60%)
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d5ff',
          300: '#a3b3ff',
          400: '#7c8aff',
          500: '#5865f2', // Main primary
          600: '#4752d4',
          700: '#3639b8',
          800: '#2e2e99',
          900: '#1a1a5c',
        },
        // Secondary: Vibrant Orange (Complementary - 30%)
        secondary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Vibrant orange
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        // Accent: Electric Purple (10% Accent)
        accent: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7', // Electric purple
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        // Tertiary: Teal/Cyan (Split-complementary accent)
        tertiary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6', // Teal
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        // Success: Vibrant Green
        success: '#10b981',
        // Error: Vibrant Red
        error: '#ef4444',
        // Warning: Vibrant Amber
        warning: '#f59e0b',
        // Neutral backgrounds
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #5865f2 0%, #f97316 50%, #a855f7 100%)',
        'gradient-subtle': 'linear-gradient(135deg, #f0f4ff 0%, #fff7ed 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1a1a5c 0%, #7c2d12 100%)',
        'gradient-accent': 'linear-gradient(135deg, #a855f7 0%, #14b8a6 100%)',
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(88, 101, 242, 0.3)',
        'glow-secondary': '0 0 20px rgba(249, 115, 22, 0.3)',
        'glow-accent': '0 0 20px rgba(168, 85, 247, 0.3)',
      },
    },
  },
  plugins: [],
}
