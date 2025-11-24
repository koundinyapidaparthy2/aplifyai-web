/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E6F7F2',
          100: '#B3E8D9',
          200: '#80D9C0',
          300: '#4DCAA7',
          400: '#3DCEA5',
          500: '#2AB890',
          600: '#249F7B',
          700: '#1E8666',
          800: '#186D51',
          900: '#12543C',
        },
        secondary: {
          50: '#FEF9E7',
          100: '#FCEDB3',
          200: '#FAE180',
          300: '#F9E45C',
          400: '#F7D938',
          500: '#F5CE14',
          600: '#D4B112',
          700: '#B39410',
          800: '#92770D',
          900: '#715A0B',
        },
        background: {
          DEFAULT: '#FFFFFF',
          light: '#F8FDFB',
          cream: '#FEF9E7',
        },
        text: {
          primary: '#1A1A1A',
          secondary: '#4A5568',
          light: '#718096',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Poppins', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px rgba(0, 0, 0, 0.05)',
        'medium': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'strong': '0 10px 40px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
};
