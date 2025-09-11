/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // Adjust based on your structure
  ],
  theme: {
    extend: {
      colors: {
        // 🎮 Game UI Theme Colors
        primary: '#00FFFF',        // Neon Blue
        secondary: '#A020F0',      // Electric Purple
        background: '#121212',     // Space Black
        surface: '#2a2d34',        // Gunmetal
        danger: '#DC143C',         // Crimson Red
        success: '#50C878',        // Emerald Green
        warning: '#FFD700',        // Royal Gold
        info: '#4682B4',           // Steel Blue

        // ✍️ Text Colors
        textPrimary: '#EAEAEA',    // Soft White
        textSecondary: '#708090',  // Slate Gray
      },
      boxShadow: {
        neon: '0 0 10px #00FFFF, 0 0 20px #00FFFF',
        glowPurple: '0 0 10px #A020F0, 0 0 20px #A020F0',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
