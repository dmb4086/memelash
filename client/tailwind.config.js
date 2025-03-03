/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
	theme: {
		extend: {
			fontFamily: {
				game: ['Bangers', 'cursive'],
				body: ['Poppins', 'sans-serif'],
			},
			colors: {
				'game-primary': '#FF6B6B',
				'game-secondary': '#4ECDC4',
				'game-accent': '#FFE66D',
				'game-neutral': '#1A535C',
				'game-dark': '#2D2D2D',
			},
			animation: {
				'bounce-slow': 'bounce 3s infinite',
				'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
			},
		},
	},
	plugins: [],
};
