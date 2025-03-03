import React, { useState } from 'react';

import Logo from './ui/Logo';

// Spirit animals array
const SPIRIT_ANIMALS = [
	'🐶',
	'🐱',
	'🦊',
	'🦁',
	'🐯',
	'🐼',
	'🐨',
	'🐮',
	'🐷',
	'🦄',
	'🐲',
	'🦖',
	'🦕',
	'🐙',
	'🦑',
	'🦀',
	'🐬',
	'🐳',
	'🦈',
	'🐊',
	'🐢',
	'🐘',
	'🦒',
	'🦓',
	'🦍',
];

interface PreLobbyProps {
	roomCode: string;
	playerName: string;
	usedEmojis: string[];
	onJoinWithEmoji: (emoji: string) => void;
	onCancel: () => void;
}

const PreLobby: React.FC<PreLobbyProps> = ({
	roomCode,
	playerName,
	usedEmojis = [],
	onJoinWithEmoji,
	onCancel,
}) => {
	const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);

	const handleEmojiClick = (emoji: string) => {
		if (!usedEmojis.includes(emoji)) {
			setSelectedEmoji(emoji);
		}
	};

	const handleJoinClick = () => {
		if (selectedEmoji && !usedEmojis.includes(selectedEmoji)) {
			onJoinWithEmoji(selectedEmoji);
		}
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
			<div className="bg-white rounded-lg p-8 max-w-md w-full">
				<div className="mb-8">
					<Logo size="sm" />
				</div>

				<div className="text-center mb-6">
					<h2 className="text-2xl font-bold mb-2">Choose Your Spirit Animal</h2>
					<p className="text-gray-600">
						Room: <span className="font-mono font-bold">{roomCode}</span> |
						Player: <span className="font-bold">{playerName}</span>
					</p>
				</div>

				<div className="grid grid-cols-5 gap-4 mb-8">
					{SPIRIT_ANIMALS.map((emoji) => {
						const isUsed = usedEmojis.includes(emoji);
						const isSelected = selectedEmoji === emoji;

						return (
							<button
								key={emoji}
								onClick={() => handleEmojiClick(emoji)}
								className={`
									text-2xl p-3 rounded-lg transition-all duration-200
									${
										isUsed
											? 'opacity-25 cursor-not-allowed bg-gray-100'
											: 'hover:bg-game-primary hover:bg-opacity-10'
									}
									${
										isSelected
											? 'bg-game-primary bg-opacity-20 ring-2 ring-game-primary'
											: 'bg-white'
									}
								`}
								disabled={isUsed}
								title={isUsed ? 'Already taken' : 'Select this spirit animal'}
							>
								{emoji}
							</button>
						);
					})}
				</div>

				<div className="flex space-x-4">
					<button className="game-button btn-outline flex-1" onClick={onCancel}>
						Go Back
					</button>
					<button
						className="game-button btn-primary flex-1"
						onClick={handleJoinClick}
						disabled={!selectedEmoji}
					>
						{!selectedEmoji ? 'Select an Emoji' : 'Join Game'}
					</button>
				</div>
			</div>
		</div>
	);
};

export default PreLobby;
