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
        crmAccent: 'var(--crm-accent)'
      }
    },
  },
  plugins: [],
}
