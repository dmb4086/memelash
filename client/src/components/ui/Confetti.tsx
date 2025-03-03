import React, { useEffect, useState, useMemo } from 'react';

interface ConfettiPiece {
	id: number;
	x: number;
	y: number;
	size: number;
	color: string;
	rotation: number;
	speed: number;
	shape: 'square' | 'circle' | 'triangle';
}

interface ConfettiProps {
	count?: number;
	active?: boolean;
	duration?: number;
	playSound?: boolean;
}

const Confetti: React.FC<ConfettiProps> = ({
	count = 50,
	active = true,
	duration = 3000,
	playSound = true,
}) => {
	const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
	const [shouldRender, setShouldRender] = useState(active);

	// Use useMemo to prevent the colors array from being recreated on each render
	const colors = useMemo(
		() => ['#FF6B6B', '#4ECDC4', '#FFE66D', '#1A535C', '#F9DC5C', '#3185FC'],
		[]
	);
	const shapes = useMemo(() => ['square', 'circle', 'triangle'] as const, []);

	useEffect(() => {
		if (active) {
			setShouldRender(true);

			// Play confetti sound
			if (playSound) {
				const audio = new Audio('/confetti.mp3');
				audio.volume = 0.3;
				audio.play().catch((err) => console.log('Audio play failed:', err));
			}

			// Create initial confetti pieces
			const initialPieces: ConfettiPiece[] = [];
			for (let i = 0; i < count; i++) {
				initialPieces.push({
					id: i,
					x: Math.random() * 100,
					y: -10 - Math.random() * 20, // Start closer to top
					size: 5 + Math.random() * 15,
					color: colors[Math.floor(Math.random() * colors.length)],
					rotation: Math.random() * 360,
					speed: 0.5 + Math.random() * 1.5, // Slower speed
					shape: shapes[Math.floor(Math.random() * shapes.length)],
				});
			}
			setPieces(initialPieces);

			// Animation frame to update positions
			let animationId: number;
			const updatePositions = () => {
				setPieces((prevPieces) =>
					prevPieces.map((piece) => ({
						...piece,
						y: piece.y + piece.speed,
						rotation: piece.rotation + piece.speed * 0.5, // Slower rotation
						// Reset pieces that fall off screen
						...(piece.y > 110
							? {
									y: -10,
									x: Math.random() * 100,
							  }
							: {}),
					}))
				);
				animationId = requestAnimationFrame(updatePositions);
			};

			animationId = requestAnimationFrame(updatePositions);

			// Set timeout to stop the confetti after duration
			const timeout = setTimeout(() => {
				cancelAnimationFrame(animationId);
				setPieces([]);
				setShouldRender(false);
			}, duration);

			// Cleanup
			return () => {
				cancelAnimationFrame(animationId);
				clearTimeout(timeout);
			};
		} else {
			setPieces([]);
			setTimeout(() => {
				setShouldRender(false);
			}, 500); // Allow time for exit animations
		}
	}, [active, count, colors, shapes, duration, playSound]);

	if (!shouldRender) return null;

	const renderShape = (piece: ConfettiPiece) => {
		switch (piece.shape) {
			case 'circle':
				return (
					<div
						className="rounded-full"
						style={{
							width: `${piece.size}px`,
							height: `${piece.size}px`,
							backgroundColor: piece.color,
							transform: `rotate(${piece.rotation}deg)`,
							opacity: 0.7,
						}}
					/>
				);
			case 'triangle':
				return (
					<div
						style={{
							width: 0,
							height: 0,
							borderLeft: `${piece.size / 2}px solid transparent`,
							borderRight: `${piece.size / 2}px solid transparent`,
							borderBottom: `${piece.size}px solid ${piece.color}`,
							transform: `rotate(${piece.rotation}deg)`,
							opacity: 0.7,
						}}
					/>
				);
			case 'square':
			default:
				return (
					<div
						style={{
							width: `${piece.size}px`,
							height: `${piece.size}px`,
							backgroundColor: piece.color,
							transform: `rotate(${piece.rotation}deg)`,
							opacity: 0.7,
						}}
					/>
				);
		}
	};

	return (
		<div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
			{pieces.map((piece) => (
				<div
					key={piece.id}
					className="absolute transition-opacity duration-500"
					style={{
						left: `${piece.x}%`,
						top: `${piece.y}%`,
					}}
				>
					{renderShape(piece)}
				</div>
			))}
		</div>
	);
};

export default Confetti;
