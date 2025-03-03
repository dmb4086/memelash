/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
	theme: {
		extend: {
			fontFamily: {
				game: ['Rubik Mono One', 'cursive'],
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
				shine: 'shine 2s infinite',
			},
			keyframes: {
				shine: {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' },
				},
			},
		},
	},
	plugins: [require('daisyui')],
	daisyui: {
		themes: [
			{
				memelash: {
					primary: '#FF6B6B',
					secondary: '#4ECDC4',
					accent: '#FFE66D',
					neutral: '#1A535C',
					'base-100': '#ffffff',
					info: '#3ABFF8',
					success: '#36D399',
					warning: '#FBBD23',
					error: '#F87272',
				},
			},
		],
	},
};
