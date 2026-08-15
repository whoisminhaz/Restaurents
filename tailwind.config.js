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
        crmDark: 'var(--crm-dark)',
        crmCard: 'var(--crm-card)',
        crmBorder: 'var(--crm-border)',
        crmText: 'var(--crm-text)',
        crmAccent: 'var(--crm-accent)',
        charcoal: '#121212',
        'charcoal-dark': '#0a0a0a',
        gold: '#c17d2e',
        'gold-light': '#e8a84c',
        ember: '#d4451a',
        ivory: '#f5f0e8',
      }
    },
  },
  plugins: [],
}
