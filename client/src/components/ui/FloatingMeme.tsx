import React from 'react';

interface FloatingMemeProps {
	position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
	color: string;
	delay?: number;
}

const FloatingMeme: React.FC<FloatingMemeProps> = ({
	position,
	color,
	delay = 0,
}) => {
	const positionClasses = {
		'top-left': 'top-0 left-0 -translate-x-1/2 -translate-y-1/2',
		'top-right': 'top-0 right-0 translate-x-1/2 -translate-y-1/2',
		'bottom-left': 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2',
		'bottom-right': 'bottom-0 right-0 translate-x-1/2 translate-y-1/2',
	};

	const animationStyle = {
		animationDelay: `${delay}s`,
	};

	return (
		<div
			className={`
        fixed ${positionClasses[position]} 
        w-32 h-32 md:w-64 md:h-64 
        opacity-20 
        rounded-lg 
        animate-pulse-fast
      `}
			style={{
				backgroundColor: color,
				...animationStyle,
			}}
		/>
	);
};

export default FloatingMeme;
