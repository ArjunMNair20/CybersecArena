/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette: Teal + Coral + Indigo
        primary: {
          DEFAULT: '#0ea5a4',
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        accent: {
          DEFAULT: '#fb7185',
          500: '#fb7185',
          600: '#f43f5e',
          700: '#e11d48',
        },
        violet: {
          DEFAULT: '#7c3aed',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        muted: {
          DEFAULT: '#6b7280',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
        },
        card: {
          DEFAULT: '#ffffff',
          dark: '#0b1220',
        },
        border: {
          DEFAULT: '#e6eef8',
          dark: '#26324a',
        },
      },
    },
  },
  plugins: [],
};
