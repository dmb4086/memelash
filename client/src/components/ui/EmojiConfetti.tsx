import React, { useEffect, useState } from 'react';

interface EmojiPiece {
	id: number;
	x: number;
	y: number;
	size: number;
	rotation: number;
	speed: number;
	emoji: string;
}

interface EmojiConfettiProps {
	emoji: string;
	count?: number;
	active?: boolean;
	duration?: number;
}

const EmojiConfetti: React.FC<EmojiConfettiProps> = ({
	emoji,
	count = 30,
	active = true,
	duration = 3000,
}) => {
	const [pieces, setPieces] = useState<EmojiPiece[]>([]);
	const [shouldRender, setShouldRender] = useState(active);

	useEffect(() => {
		if (active) {
			setShouldRender(true);
		}

		// Create initial emoji pieces
		if (active) {
			const initialPieces: EmojiPiece[] = [];
			for (let i = 0; i < count; i++) {
				initialPieces.push({
					id: i,
					x: Math.random() * 100, // percentage across screen
					y: -10 - Math.random() * 100, // start above screen
					size: 20 + Math.random() * 20, // slightly larger for emojis
					rotation: Math.random() * 360,
					speed: 1 + Math.random() * 3,
					emoji: emoji,
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
						rotation: piece.rotation + piece.speed,
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
	}, [active, count, emoji, duration]);

	if (!shouldRender) return null;

	return (
		<div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
			{pieces.map((piece) => (
				<div
					key={piece.id}
					className="absolute transition-opacity duration-500"
					style={{
						left: `${piece.x}%`,
						top: `${piece.y}%`,
						transform: `rotate(${piece.rotation}deg)`,
						fontSize: `${piece.size}px`,
					}}
				>
					{piece.emoji}
				</div>
			))}
		</div>
	);
};

export default EmojiConfetti;
