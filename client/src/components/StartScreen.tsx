import React, { useState, useEffect } from 'react';
import Logo from './ui/Logo';
import Confetti from './ui/Confetti';
import Modal from './ui/Modal';
import GameLobby from './GameLobby';
import { useGame } from '../context/GameContext';
import EmojiPickerModal from './EmojiPickerModal';
import PreLobby from './PreLobby';

// Common emojis that work well as spirit animals
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

const StartScreen: React.FC = () => {
	const [showJoinForm, setShowJoinForm] = useState(false);
	const [showConfetti, setShowConfetti] = useState(false);
	const [showHowToPlay, setShowHowToPlay] = useState(false);
	const [isLoaded, setIsLoaded] = useState(false);
	const [localRoomCode, setLocalRoomCode] = useState('');
	const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const [isCheckingRoom, setIsCheckingRoom] = useState(false);
	const [localPlayerName, setLocalPlayerName] = useState('');
	const [localUsedEmojis, setLocalUsedEmojis] = useState<string[]>([]);
	const [showPreLobby, setShowPreLobby] = useState(false);
	const [validatedRoomCode, setValidatedRoomCode] = useState('');
	const [isJoining, setIsJoining] = useState(false);
	const [playerName, setPlayerName] = useState('');
	const { state, dispatch } = useGame();
	const { error, usedEmojis } = state;
	const [localError, setLocalError] = useState<string | null>(null);

	// Animation effect when component mounts
	useEffect(() => {
		const timer = setTimeout(() => {
			setIsLoaded(true);
		}, 300);

		return () => clearTimeout(timer);
	}, []);

	const handleCreateRoom = () => {
		console.log('[StartScreen] Creating room with player:', playerName);
		if (state.socket) {
			dispatch({
				type: 'SET_PLAYER_NAME',
				payload: playerName,
			});

			state.socket.emit('create_room', { playerName });
		} else {
			console.error('[StartScreen] Socket not connected');
			dispatch({
				type: 'SET_ERROR',
				payload: 'Connection error. Please try again.',
			});
		}
	};

	const handleJoinGame = () => {
		if (state.socket) {
			state.socket.emit('check_room', { roomCode: localRoomCode });
			setIsCheckingRoom(true);
		}
	};

	useEffect(() => {
		if (!state.socket) return;

		const handleRoomChecked = (data: any) => {
			console.log('[StartScreen] Room checked:', data);
			setIsCheckingRoom(false);

			if (data.exists) {
				setValidatedRoomCode(localRoomCode);
				setLocalUsedEmojis(data.usedEmojis || []);
				setLocalPlayerName(playerName);
				setShowPreLobby(true);
				setLocalError(null);
			} else {
				setLocalError('Room not found. Please check the code and try again.');
				setTimeout(() => {
					setLocalError(null);
				}, 3000);
			}
		};

		state.socket.on('room_checked', handleRoomChecked);
		return () => {
			state.socket?.off('room_checked', handleRoomChecked);
		};
	}, [state.socket, localRoomCode, playerName]);

	const handleJoinWithEmoji = (emoji: string) => {
		console.log('[StartScreen] Joining with emoji:', emoji);
		setIsJoining(true);

		if (state.socket) {
			state.socket.emit('join_room', {
				roomCode: validatedRoomCode,
				playerName: localPlayerName,
				emoji: emoji,
			});
		}
	};

	useEffect(() => {
		if (!state.socket) return;

		const handleJoinError = (error: any) => {
			console.log('[StartScreen] Join error:', error);
			setIsJoining(false);
			alert(error.message);
		};

		state.socket.on('game_error', handleJoinError);
		return () => {
			state.socket?.off('game_error', handleJoinError);
		};
	}, [state.socket]);

	const handlePlayerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPlayerName(e.target.value);
	};

	const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const sanitizedCode = e.target.value
			.toUpperCase()
			.replace(/[^A-Z0-9]/g, '')
			.slice(0, 4);

		setLocalRoomCode(sanitizedCode);
		e.target.value = sanitizedCode;

		if (error) {
			dispatch({ type: 'CLEAR_ERROR' });
		}

		if (sanitizedCode.length === 4 && playerName.trim()) {
			setIsCheckingRoom(true);
			if (state.socket) {
				state.socket.emit('check_room', { roomCode: sanitizedCode });
			}
		}
	};

	const openEmojiPicker = () => {
		console.log('Opening emoji picker');

		if (state.socket && localRoomCode.length === 4) {
			state.socket.emit('check_room', { roomCode: localRoomCode });
		}

		setShowEmojiPicker(true);
	};

	const closeEmojiPicker = () => {
		console.log('Closing emoji picker');
		setShowEmojiPicker(false);
	};

	const selectEmoji = (emoji: string) => {
		console.log('Selected emoji:', emoji);

		setSelectedEmoji(emoji);

		setShowEmojiPicker(false);
	};

	const handleSwitchToJoinForm = () => {
		setShowJoinForm(true);
		setSelectedEmoji(null);
	};

	if (state.roomCode) {
		console.log('Transitioning to GameLobby with roomCode:', state.roomCode);
		console.log('Current players in state:', state.players);
		return <GameLobby />;
	}

	if (showPreLobby) {
		console.log('Rendering PreLobby with:', {
			roomCode: validatedRoomCode,
			playerName: localPlayerName,
			usedEmojis: localUsedEmojis,
		});

		return (
			<PreLobby
				roomCode={validatedRoomCode}
				playerName={localPlayerName}
				usedEmojis={localUsedEmojis}
				onJoinWithEmoji={handleJoinWithEmoji}
				onCancel={() => setShowPreLobby(false)}
			/>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-game-dark via-game-neutral to-game-dark flex items-center justify-center p-4">
			{showConfetti && <Confetti duration={5000} count={100} />}

			<div className="max-w-md w-full">
				<div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 space-y-8 relative overflow-hidden">
					{/* Decorative background elements */}
					<div className="absolute inset-0 bg-gradient-to-br from-transparent via-game-primary/5 to-transparent" />
					<div className="absolute -inset-1 bg-gradient-to-r from-game-primary/10 via-game-accent/10 to-game-secondary/10 blur-2xl opacity-70" />

					{/* Content */}
					<div className="relative">
						<Logo size="lg" className="mb-6" />

						<p className="font-game text-game-neutral text-xl text-center leading-relaxed mb-8">
							WHERE MEMES MEET
							<br />
							WIT, AND LAUGHTER
							<br />
							KNOWS NO BOUNDS! 🎭
						</p>

						{error && (
							<div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-center">
								{error}
							</div>
						)}

						<div className="space-y-6">
							<div className="relative">
								<input
									type="text"
									placeholder="What shall we call you?"
									value={playerName}
									onChange={handlePlayerNameChange}
									maxLength={20}
									className="
										w-full px-6 py-4 
										bg-white/50 
										rounded-xl
										border-2 border-game-neutral/10
										text-lg font-body
										placeholder-game-neutral/50
										focus:outline-none focus:ring-2 focus:ring-game-primary/50
										transition-all duration-300
									"
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<button
									onClick={handleCreateRoom}
									disabled={!playerName.trim()}
									className="
										px-6 py-4
										bg-game-primary/90 hover:bg-game-primary
										text-white font-game
										rounded-xl
										transform hover:scale-105 hover:-rotate-1
										transition-all duration-300
										shadow-lg hover:shadow-xl
										disabled:opacity-50 disabled:cursor-not-allowed
									"
								>
									CREATE ROOM
								</button>
								<button
									onClick={handleSwitchToJoinForm}
									disabled={!playerName.trim()}
									className="
										px-6 py-4
										bg-game-secondary/90 hover:bg-game-secondary
										text-white font-game
										rounded-xl
										transform hover:scale-105 hover:rotate-1
										transition-all duration-300
										shadow-lg hover:shadow-xl
										disabled:opacity-50 disabled:cursor-not-allowed
									"
								>
									JOIN ROOM
								</button>
							</div>
						</div>

						<button
							onClick={() => setShowHowToPlay(true)}
							className="
								mt-6 mx-auto block
								text-game-neutral/70 hover:text-game-neutral
								font-body text-sm
								underline decoration-dotted
								transition-colors duration-300
							"
						>
							How to Play
						</button>
					</div>
				</div>
			</div>

			{/* Join Room Modal */}
			<Modal
				isOpen={showJoinForm}
				onClose={() => {
					setShowJoinForm(false);
					setLocalError(null);
				}}
				title="Join a Room"
			>
				<div className="space-y-6">
					<div className="form-control">
						<label className="label">
							<span className="label-text text-lg">Room Code</span>
						</label>
						<input
							type="text"
							placeholder="XXXX"
							className="input input-bordered w-full text-center text-3xl tracking-widest uppercase py-4 font-mono"
							onChange={handleRoomCodeChange}
							maxLength={4}
						/>
						<label className="label">
							<span className="label-text-alt text-gray-500">
								Enter the 4-letter code from your host
							</span>
						</label>
					</div>

					{localError && (
						<div className="text-red-500 text-sm text-center font-medium">
							{localError}
						</div>
					)}

					<button
						className="game-button btn-primary w-full"
						onClick={handleJoinGame}
						disabled={localRoomCode.length !== 4 || isCheckingRoom}
					>
						{isCheckingRoom ? (
							<span className="flex items-center justify-center">
								<span className="animate-spin mr-2">⚡</span>
								Looking for Room...
							</span>
						) : (
							'Join Game'
						)}
					</button>
				</div>
			</Modal>

			{/* How to Play Modal */}
			<Modal
				isOpen={showHowToPlay}
				onClose={() => setShowHowToPlay(false)}
				title="How to Play MemeLash"
			>
				<div className="space-y-4 font-body text-game-neutral">
					<p>
						🎮 <strong>Game Flow:</strong>
					</p>
					<ul className="list-disc pl-5 space-y-2">
						<li>Create a room or join an existing one</li>
						<li>Pick your spirit emoji to represent you</li>
						<li>Take turns creating hilarious meme combinations</li>
						<li>Vote for the funniest meme each round</li>
						<li>Collect points and climb to meme mastery!</li>
					</ul>
					<p>
						✨ <strong>Tips:</strong>
					</p>
					<ul className="list-disc pl-5 space-y-2">
						<li>Be creative with your combinations</li>
						<li>Think outside the box</li>
						<li>The funnier, the better!</li>
					</ul>
				</div>
			</Modal>

			{showEmojiPicker && (
				<EmojiPickerModal
					onClose={closeEmojiPicker}
					onSelect={selectEmoji}
					usedEmojis={state.usedEmojis || []}
				/>
			)}
		</div>
	);
};

export default StartScreen;
