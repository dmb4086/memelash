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
		sm: 'text-2xl',
		md: 'text-3xl',
		lg: 'text-4xl',
		xl: 'text-5xl',
	};

	return (
		<div className={`text-center ${className}`}>
			<div
				className={`
					inline-block
					font-game 
					${sizeClasses[size]} 
					tracking-wider
					${animated ? 'transform transition-all duration-300' : ''}
					relative
					py-2
				`}
			>
				<div className="relative inline-flex items-baseline gap-[1px]">
					<span
						className="text-game-primary"
						style={{
							textShadow: '2px 2px 0px rgba(0,0,0,0.1)',
							filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
						}}
					>
						MEME
					</span>
					<span
						className="text-game-accent"
						style={{
							textShadow: '2px 2px 0px rgba(0,0,0,0.1)',
							filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
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
						`}
						style={{
							textShadow: '2px 2px 0px rgba(0,0,0,0.1)',
							filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
						}}
					>
						!
					</span>
				</div>
				{animated && (
					<div
						className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shine"
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
