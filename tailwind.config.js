/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0f',
        surface: '#111118',
        border: '#1e1e2e',
        accent: '#00e5a0',
        'accent-dim': '#00b87a',
        muted: '#6b7280',
        text: '#e2e8f0',
      },
      fontFamily: {
        sans: ['var(--font-space)', 'system-ui'],
        display: ['var(--font-syne)', 'system-ui'],
      },
    },
  },
  plugins: [],
}
