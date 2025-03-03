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
		<div className={`text-center ${className}`}>
			<div
				className={`
					inline-block
					font-game 
					${sizeClasses[size]} 
					tracking-wider
					${animated ? 'transform transition-all duration-300 hover:scale-105' : ''}
					relative
					py-3
				`}
			>
				<div className="relative inline-flex items-baseline gap-[2px]">
					<span
						className="text-game-primary transform hover:-rotate-2 transition-transform duration-300"
						style={{
							textShadow: '3px 3px 0px rgba(0,0,0,0.15)',
							filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
						}}
					>
						MEME
					</span>
					<span
						className="text-game-accent transform hover:rotate-2 transition-transform duration-300"
						style={{
							textShadow: '3px 3px 0px rgba(0,0,0,0.15)',
							filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
						}}
					>
						LASH
					</span>
					<span
						className={`
							text-game-secondary 
							${animated ? 'animate-bounce' : ''} 
							inline-block
							ml-1
							transform hover:rotate-12 transition-transform duration-300
						`}
						style={{
							textShadow: '3px 3px 0px rgba(0,0,0,0.15)',
							filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
						}}
					>
						!
					</span>
				</div>
				{animated && (
					<div
						className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shine pointer-events-none"
						style={{
							maskImage:
								'linear-gradient(to right, transparent, white, transparent)',
							WebkitMaskImage:
								'linear-gradient(to right, transparent, white, transparent)',
						}}
					/>
				)}
			</div>
		</div>
	);
};

export default Logo;
