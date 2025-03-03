import React from 'react';
import Logo from './ui/Logo';

interface PreLobbyProps {
	roomCode: string;
	playerName: string;
	usedEmojis: string[];
	onJoinWithEmoji: (emoji: string) => void;
	onCancel: () => void;
}

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

const PreLobby: React.FC<PreLobbyProps> = ({
	roomCode,
	playerName,
	usedEmojis,
	onJoinWithEmoji,
	onCancel,
}) => {
	return (
		<div className="min-h-screen bg-gradient-to-br from-game-dark via-game-neutral to-game-dark flex items-center justify-center p-4">
			<div className="max-w-md w-full">
				<div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 space-y-8 relative overflow-hidden">
					{/* Decorative background elements */}
					<div className="absolute inset-0 bg-gradient-to-br from-transparent via-game-primary/5 to-transparent" />
					<div className="absolute -inset-1 bg-gradient-to-r from-game-primary/10 via-game-accent/10 to-game-secondary/10 blur-2xl opacity-70" />

					{/* Content */}
					<div className="relative">
						<Logo size="lg" className="mb-6" />

						<div className="text-center space-y-4 mb-8">
							<div className="space-y-2">
								<h2 className="font-game text-2xl text-game-neutral">
									Choose Your Spirit Animal
								</h2>
								<div className="font-body">
									<p className="text-game-neutral/70">
										Display Name:{' '}
										<span className="font-semibold text-game-neutral">
											{playerName}
										</span>
									</p>
									<p className="text-game-neutral/70">
										Room Code:{' '}
										<span className="font-mono font-bold text-game-primary">
											{roomCode}
										</span>
									</p>
								</div>
							</div>
							<p className="text-game-neutral/70 font-body italic">
								Pick an emoji to represent you in the game!
							</p>
						</div>

						<div className="grid grid-cols-5 gap-3 mb-8">
							{SPIRIT_ANIMALS.map((emoji) => {
								const isUsed = usedEmojis.includes(emoji);
								return (
									<button
										key={emoji}
										onClick={() => !isUsed && onJoinWithEmoji(emoji)}
										className={`
											aspect-square
											flex items-center justify-center
											text-2xl
											rounded-xl
											transition-all duration-300
											${
												isUsed
													? 'opacity-30 cursor-not-allowed bg-gray-100'
													: 'hover:scale-110 hover:rotate-12 bg-white shadow-lg hover:shadow-xl'
											}
										`}
										disabled={isUsed}
										title={
											isUsed ? 'Already taken' : 'Choose this spirit animal'
										}
									>
										{emoji}
									</button>
								);
							})}
						</div>

						<div className="flex gap-4">
							<button
								onClick={onCancel}
								className="
									flex-1
									px-6 py-4
									bg-gray-100 hover:bg-gray-200
									text-game-neutral font-game
									rounded-xl
									transform hover:scale-105 hover:-rotate-1
									transition-all duration-300
									shadow-lg hover:shadow-xl
								"
							>
								GO BACK
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PreLobby;
