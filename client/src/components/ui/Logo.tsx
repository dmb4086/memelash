import React from 'react';

interface LogoProps {
	size?: 'sm' | 'md' | 'lg' | 'xl';
	className?: string;
	animated?: boolean;
}

const Logo: React.FC<LogoProps> = ({
	size = 'lg',
	className = '',
	animated = true,
}) => {
	const sizeClasses = {
		sm: 'text-3xl',
		md: 'text-4xl',
		lg: 'text-5xl',
		xl: 'text-6xl',
	};

	return (
		<div className={`font-game text-center ${sizeClasses[size]} ${className}`}>
			<span
				className={`text-game-primary ${
					animated ? 'hover:animate-bounce inline-block' : ''
				}`}
				style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}
			>
				Meme
			</span>
			<span
				className={`text-game-accent ${
					animated ? 'hover:animate-bounce inline-block' : ''
				}`}
				style={{
					textShadow: '2px 2px 0px rgba(0,0,0,0.1)',
					animationDelay: '0.1s',
				}}
			>
				Lash
			</span>
			<span
				className={`text-game-secondary ${
					animated ? 'hover:animate-ping inline-block' : ''
				}`}
				style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}
			>
				!
			</span>
		</div>
	);
};

export default Logo;
