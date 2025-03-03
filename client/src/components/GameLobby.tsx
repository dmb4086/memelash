import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import EmojiConfetti from './ui/EmojiConfetti';
import Modal from './ui/Modal';

// Spirit animals for selection
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

const GameLobby: React.FC = () => {
	const { state, dispatch } = useGame();
	const { roomCode, players, isHost, currentPlayer } = state;
	const [copied, setCopied] = useState(false);
	const [showConfetti, setShowConfetti] = useState(false);
	const [confettiEmoji, setConfettiEmoji] = useState<string>('🎉');
	const [newPlayerName, setNewPlayerName] = useState<string>('');
	const [showSpiritAnimalPicker, setShowSpiritAnimalPicker] = useState(false);
	const prevPlayersRef = useRef<typeof players>([]);

	// Check if a new player has joined
	useEffect(() => {
		// Only show confetti if players count increased (someone joined)
		if (
			players.length > prevPlayersRef.current.length &&
			prevPlayersRef.current.length > 0
		) {
			// Find the new player by comparing the current players with the previous players
			const newPlayers = players.filter(
				(player) => !prevPlayersRef.current.some((p) => p.id === player.id)
			);

			if (newPlayers.length > 0 && newPlayers[0].emoji) {
				setConfettiEmoji(newPlayers[0].emoji);
				setNewPlayerName(newPlayers[0].name);
				setShowConfetti(true);
				setTimeout(() => setShowConfetti(false), 3000);
			}
		}
		prevPlayersRef.current = [...players];
	}, [players]);

	// Function to copy room code to clipboard
	const copyRoomCode = () => {
		if (roomCode) {
			navigator.clipboard.writeText(roomCode);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	// Function to update the host's spirit animal
	const handleSpiritAnimalSelect = (emoji: string) => {
		if (isHost && roomCode) {
			console.log('Host selected spirit animal:', emoji);

			dispatch({
				type: 'UPDATE_SPIRIT_ANIMAL',
				payload: {
					emoji,
					roomCode,
				},
			});
		}
		setShowSpiritAnimalPicker(false);
	};

	// Get used spirit animals
	const usedSpiritAnimals = players
		.filter((player) => player.id !== currentPlayer?.id)
		.map((player) => player.emoji)
		.filter((emoji): emoji is string => !!emoji);

	// Check if host needs to select a spirit animal
	const hostNeedsToSelectSpiritAnimal =
		isHost && (!currentPlayer?.emoji || currentPlayer.emoji === '');

	// Auto-open the spirit animal picker for host if they don't have one
	useEffect(() => {
		if (hostNeedsToSelectSpiritAnimal && !showSpiritAnimalPicker) {
			// Add a small delay to ensure the component is fully mounted
			const timer = setTimeout(() => {
				setShowSpiritAnimalPicker(true);
			}, 500);

			return () => clearTimeout(timer);
		}
	}, [hostNeedsToSelectSpiritAnimal, showSpiritAnimalPicker]);

	// Add effect for confetti when new player joins
	useEffect(() => {
		if (state.socket) {
			const handlePlayerJoined = (data: { players: any[] }) => {
				console.log('Player joined event received in GameLobby:', data);
				// Find the new player by comparing with previous state
				if (data.players.length > prevPlayersRef.current.length) {
					const newPlayers = data.players.filter(
						(player) => !prevPlayersRef.current.some((p) => p.id === player.id)
					);

					if (newPlayers.length > 0) {
						const newPlayer = newPlayers[0];
						setConfettiEmoji(newPlayer.emoji || '🎉');
						setNewPlayerName(newPlayer.name);
						setShowConfetti(true);

						// Keep confetti visible longer and fade out smoothly
						setTimeout(() => {
							setShowConfetti(false);
						}, 5000);
					}
				}

				// Update our reference to current players
				prevPlayersRef.current = [...data.players];
			};

			state.socket.on('player_joined', handlePlayerJoined);
			state.socket.on('join_room_success', () => {
				// Show confetti for the player who just joined
				setConfettiEmoji('🎉');
				setShowConfetti(true);
				setTimeout(() => {
					setShowConfetti(false);
				}, 5000);
			});

			return () => {
				state.socket?.off('player_joined', handlePlayerJoined);
				state.socket?.off('join_room_success');
			};
		}
	}, [state.socket]);

	// Log players whenever they change
	useEffect(() => {
		console.log('Current players in GameLobby:', players);
	}, [players]);

	return (
		<div className="game-container">
			{showConfetti && (
				<>
					<EmojiConfetti
						emoji={confettiEmoji}
						count={50}
						duration={5000}
						active={showConfetti}
					/>
					{newPlayerName && (
						<div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 rounded-lg px-6 py-3 z-50 text-center shadow-lg animate-fade-in">
							<p className="text-xl font-game">
								{newPlayerName} joined the party! {confettiEmoji}
							</p>
						</div>
					)}
				</>
			)}

			<Modal
				isOpen={showSpiritAnimalPicker}
				onClose={() => setShowSpiritAnimalPicker(false)}
				title="Choose Your Spirit Animal"
			>
				<div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
					{SPIRIT_ANIMALS.map((emoji, index) => {
						const isUsed = usedSpiritAnimals.includes(emoji);
						return (
							<button
								key={index}
								className={`w-14 h-14 text-3xl flex items-center justify-center rounded-lg transition-colors ${
									currentPlayer?.emoji === emoji
										? 'bg-game-accent'
										: isUsed
										? 'bg-gray-200 cursor-not-allowed opacity-50'
										: 'bg-white hover:bg-gray-100'
								}`}
								onClick={() => !isUsed && handleSpiritAnimalSelect(emoji)}
								disabled={isUsed}
								title={
									isUsed ? 'This spirit animal is already taken' : undefined
								}
							>
								{emoji}
								{isUsed && (
									<div className="absolute inset-0 flex items-center justify-center">
										<div className="w-10 h-0.5 bg-gray-400 transform rotate-45"></div>
									</div>
								)}
							</button>
						);
					})}
				</div>
				{usedSpiritAnimals.length > 0 && (
					<p className="text-sm text-gray-500 mt-4 text-center">
						Grayed out spirit animals are already taken by other players in this
						room.
					</p>
				)}
			</Modal>

			<div className="game-card max-w-2xl">
				{hostNeedsToSelectSpiritAnimal && (
					<div className="bg-game-accent text-game-dark p-4 rounded-lg mb-6 text-center">
						<p className="font-bold mb-2">Welcome to your game room!</p>
						<p className="mb-4">
							As the host, please choose your spirit animal:
						</p>
						<button
							className="game-button btn-primary animate-pulse"
							onClick={() => setShowSpiritAnimalPicker(true)}
						>
							Choose Spirit Animal
						</button>
					</div>
				)}

				<div className="flex flex-col md:flex-row justify-between items-center mb-8">
					<h2 className="game-title text-3xl md:text-4xl mb-4 md:mb-0">
						Game Lobby
					</h2>

					<div className="bg-game-accent text-game-dark p-3 rounded-lg text-center shadow-lg transform hover:scale-105 transition-transform">
						<p className="text-xs uppercase font-bold mb-1">Room Code</p>
						<div className="flex items-center justify-center gap-2">
							<span className="text-3xl font-game tracking-widest">
								{roomCode}
							</span>
							<button
								onClick={copyRoomCode}
								className="btn btn-sm btn-circle bg-white hover:bg-gray-100"
								title="Copy room code"
							>
								{copied ? (
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-4 w-4 text-green-500"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clipRule="evenodd"
										/>
									</svg>
								) : (
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-4 w-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
										/>
									</svg>
								)}
							</button>
						</div>
					</div>
				</div>

				<div className="mb-8">
					<div className="flex justify-between items-center mb-4">
						<h3 className="text-xl font-bold">Players ({players.length})</h3>
						<span className="bg-game-secondary text-white px-3 py-1 rounded-full text-sm">
							{players.length < 3
								? 'Waiting for more players...'
								: 'Ready to play!'}
						</span>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{players.map((player) => (
							<div
								key={player.id}
								className="flex items-center p-4 bg-white rounded-lg shadow-md border-l-4 border-game-primary hover:shadow-lg transition-shadow"
							>
								{player.emoji ? (
									<div className="w-12 h-12 bg-gradient-to-br from-game-primary to-game-secondary rounded-full flex items-center justify-center text-2xl shadow-md">
										{player.emoji}
									</div>
								) : (
									<div className="w-12 h-12 bg-gradient-to-br from-game-primary to-game-secondary rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
										No Spirit
									</div>
								)}
								<div className="ml-4">
									<p className="font-semibold text-lg">{player.name}</p>
									{player.isHost && (
										<span className="text-xs bg-game-primary text-white px-2 py-1 rounded-full">
											Host
										</span>
									)}
									{player.id === currentPlayer?.id &&
										!player.emoji &&
										isHost && (
											<button
												className="text-xs bg-game-secondary text-white px-2 py-1 rounded-full ml-2"
												onClick={() => setShowSpiritAnimalPicker(true)}
											>
												Choose Spirit
											</button>
										)}
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="border-t border-gray-200 pt-6">
					{isHost ? (
						<div className="space-y-4">
							<p className="text-center text-gray-600 mb-4">
								Share the room code with your friends to join the game!
							</p>
							<button
								className="game-button btn-primary"
								disabled={players.length < 2 || hostNeedsToSelectSpiritAnimal}
							>
								{hostNeedsToSelectSpiritAnimal
									? 'Choose a Spirit Animal First'
									: players.length < 2
									? 'Waiting for Players...'
									: 'Start Game'}
							</button>
						</div>
					) : (
						<div className="text-center bg-gray-50 p-4 rounded-lg">
							<div className="animate-pulse-fast">
								<p className="text-lg">Waiting for host to start the game...</p>
							</div>
						</div>
					)}

					<button
						className="game-button btn-outline mt-4"
						onClick={() => {
							// Leave room logic will be implemented later
							window.location.reload();
						}}
					>
						Leave Game
					</button>
				</div>
			</div>
		</div>
	);
};

export default GameLobby;
