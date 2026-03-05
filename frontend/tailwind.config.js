/** @type {import('tailwindcss').Config} */
export default {
  content: [
   "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: "#001b3d",
        "ocean-dark": "#00142f"
    },
  },
  plugins: [],
}
}

