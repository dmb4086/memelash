import React from 'react';

// Define props interface
interface EmojiPickerModalProps {
	onClose: () => void;
	onSelect: (emoji: string) => void;
	usedEmojis: string[];
}

// Basic emoji list
const EMOJIS = [
	'🐶',
	'🐱',
	'🐭',
	'🐹',
	'🐰',
	'🦊',
	'🐻',
	'🐼',
	'🐨',
	'🐯',
	'🦁',
	'🐮',
	'🐷',
	'🐸',
	'🐵',
];

const EmojiPickerModal: React.FC<EmojiPickerModalProps> = ({
	onClose,
	onSelect,
	usedEmojis,
}) => {
	// Direct event handler with no stopPropagation
	const handleEmojiClick = (emoji: string) => {
		console.log('Emoji clicked:', emoji);
		onSelect(emoji);
	};

	console.log('Modal rendering with usedEmojis:', usedEmojis);

	return (
		// Position absolute overlay div with high z-index
		<div
			id="emoji-modal-container"
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundColor: 'rgba(0,0,0,0.5)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				zIndex: 10000,
			}}
			onClick={onClose}
		>
			{/* Main modal content */}
			<div
				id="emoji-modal-content"
				style={{
					backgroundColor: 'white',
					padding: '20px',
					borderRadius: '10px',
					maxWidth: '500px',
					width: '90%',
					zIndex: 10001,
				}}
				onClick={(e) => e.stopPropagation()}
			>
				<h2 style={{ marginBottom: '15px', fontWeight: 'bold' }}>
					Choose Your Spirit Animal
				</h2>

				{/* Debug info */}
				<div style={{ marginBottom: '10px', fontSize: '12px', color: '#666' }}>
					Used emojis: {usedEmojis.join(', ')}
				</div>

				{/* Emoji grid with inline styles */}
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(5, 1fr)',
						gap: '10px',
					}}
				>
					{EMOJIS.map((emoji, index) => {
						const isUsed = usedEmojis.includes(emoji);
						return (
							<button
								key={index}
								style={{
									width: '50px',
									height: '50px',
									fontSize: '24px',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									backgroundColor: isUsed ? '#f0f0f0' : 'white',
									border: '1px solid #ddd',
									borderRadius: '8px',
									opacity: isUsed ? 0.5 : 1,
									cursor: isUsed ? 'not-allowed' : 'pointer',
									position: 'relative',
								}}
								onClick={() => !isUsed && handleEmojiClick(emoji)}
								disabled={isUsed}
							>
								{emoji}
								{isUsed && (
									<div
										style={{
											position: 'absolute',
											width: '100%',
											height: '1px',
											backgroundColor: '#666',
											transform: 'rotate(45deg)',
										}}
									></div>
								)}
							</button>
						);
					})}
				</div>

				{/* Close button */}
				<div style={{ marginTop: '20px', textAlign: 'right' }}>
					<button
						onClick={onClose}
						style={{
							padding: '8px 16px',
							backgroundColor: '#4B53BD',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer',
						}}
					>
						Close
					</button>
				</div>
			</div>
		</div>
	);
};

export default EmojiPickerModal;
