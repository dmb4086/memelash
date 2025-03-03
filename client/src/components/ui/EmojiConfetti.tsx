import React, { useEffect, useState, useCallback, useRef } from 'react';

interface EmojiPiece {
	id: number;
	x: number;
	y: number;
	size: number;
	rotation: number;
	speed: number;
	emoji: string;
	opacity: number;
	xSpeed: number;
}

interface EmojiConfettiProps {
	emoji: string;
	count?: number;
	active?: boolean;
	duration?: number;
	playSound?: boolean;
}

const EmojiConfetti: React.FC<EmojiConfettiProps> = ({
	emoji,
	count = 30,
	active = true,
	duration = 3000,
	playSound = true,
}) => {
	const [pieces, setPieces] = useState<EmojiPiece[]>([]);
	const [shouldRender, setShouldRender] = useState(active);
	const [isExiting, setIsExiting] = useState(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	// Pre-load audio
	useEffect(() => {
		const audio = new Audio('/sounds/confetti.m4a');
		audio.volume = 0.5;
		audio.preload = 'auto';
		audioRef.current = audio;

		return () => {
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current = null;
			}
		};
	}, []);

	const createPiece = useCallback(
		(index: number): EmojiPiece => ({
			id: index,
			x: Math.random() * 100,
			y: -10 - Math.random() * 20,
			size: 15 + Math.random() * 15,
			rotation: Math.random() * 360,
			speed: 2 + Math.random() * 2,
			emoji: emoji,
			opacity: 1,
			xSpeed: (Math.random() - 0.5) * 2,
		}),
		[emoji]
	);

	useEffect(() => {
		if (active) {
			setIsExiting(false);
			setShouldRender(true);

			// Play sound
			if (playSound && audioRef.current) {
				console.log('[EmojiConfetti] Playing sound');
				audioRef.current.currentTime = 0;
				audioRef.current
					.play()
					.then(() => console.log('[EmojiConfetti] Sound played successfully'))
					.catch((err) => console.error('[EmojiConfetti] Sound failed:', err));
			}

			// Initialize pieces
			const initialPieces = Array.from({ length: count }, (_, i) =>
				createPiece(i)
			);
			setPieces(initialPieces);

			let lastTime = performance.now();
			let animationId: number;

			const animate = (currentTime: number) => {
				const deltaTime = (currentTime - lastTime) / 16;
				lastTime = currentTime;

				setPieces((prevPieces) =>
					prevPieces
						.map((piece) => {
							const gravity = isExiting ? 0.3 : 0.2;
							const newSpeed = piece.speed + gravity * deltaTime;
							const newY = piece.y + newSpeed * deltaTime;
							const newX = piece.x + piece.xSpeed * deltaTime;

							const newOpacity =
								newY > 80 ? Math.max(0, 1 - (newY - 80) / 40) : 1;

							if (!isExiting && newY > 110) {
								return createPiece(piece.id);
							}

							return {
								...piece,
								y: newY,
								x: newX,
								speed: newSpeed,
								rotation: piece.rotation + piece.speed * 0.5 * deltaTime,
								opacity: newOpacity,
							};
						})
						.filter((piece) => piece.y <= 200 && piece.opacity > 0)
				);

				animationId = requestAnimationFrame(animate);
			};

			animationId = requestAnimationFrame(animate);

			const exitTimeout = setTimeout(() => {
				setIsExiting(true);
			}, duration);

			const cleanupTimeout = setTimeout(() => {
				cancelAnimationFrame(animationId);
				setPieces([]);
				setShouldRender(false);
			}, duration + 4000);

			return () => {
				cancelAnimationFrame(animationId);
				clearTimeout(exitTimeout);
				clearTimeout(cleanupTimeout);
			};
		} else {
			setIsExiting(true);
			setTimeout(() => {
				setPieces([]);
				setShouldRender(false);
			}, 4000);
		}
	}, [active, count, createPiece, duration, playSound, isExiting]);

	if (!shouldRender) return null;

	return (
		<div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
			{pieces.map((piece) => (
				<div
					key={piece.id}
					className="absolute will-change-transform"
					style={{
						left: `${piece.x}%`,
						top: `${piece.y}%`,
						transform: `rotate(${piece.rotation}deg)`,
						fontSize: `${piece.size}px`,
						opacity: piece.opacity,
						transition: 'opacity 0.3s ease-out',
					}}
				>
					{piece.emoji}
				</div>
			))}
		</div>
	);
};

export default EmojiConfetti;
