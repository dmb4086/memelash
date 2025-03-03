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

	const { state, dispatch } = useGame();
	const { playerName, roomCode, error, usedEmojis } = state;

	// Animation effect when component mounts
	useEffect(() => {
		const timer = setTimeout(() => {
			setIsLoaded(true);
		}, 300);

		return () => clearTimeout(timer);
	}, []);

	const handleCreateGame = () => {
		if (state.socket) {
			dispatch({
				type: 'CREATE_ROOM',
				payload: { playerName },
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
			} else {
				dispatch({
					type: 'SET_ERROR',
					payload: 'Room not found. Please check the code and try again.',
				});
				setTimeout(() => {
					dispatch({ type: 'CLEAR_ERROR' });
				}, 3000);
			}
		};

		state.socket.on('room_checked', handleRoomChecked);
		return () => {
			state.socket?.off('room_checked', handleRoomChecked);
		};
	}, [state.socket, localRoomCode, playerName, dispatch]);

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
		dispatch({
			type: 'SET_PLAYER_NAME',
			payload: e.target.value,
		});
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

	if (roomCode) {
		console.log('Transitioning to GameLobby with roomCode:', roomCode);
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
		<div className="game-container">
			{showConfetti && <Confetti duration={5000} count={100} />}

			<Modal
				isOpen={showHowToPlay}
				onClose={() => setShowHowToPlay(false)}
				title="How to Play MemeLash"
			>
				<div className="space-y-6">
					<p className="text-lg text-gray-700">
						Get ready for the ultimate meme party game! Combine your wit with
						iconic memes for endless laughs.
					</p>
					<div>
						<h3 className="text-xl font-bold text-game-primary mb-3">
							Game Flow
						</h3>
						<ol className="list-decimal list-inside space-y-3 text-gray-700">
							<li className="flex items-center space-x-2">
								<span>📸</span>
								<span>Each round reveals a fresh meme canvas</span>
							</li>
							<li className="flex items-center space-x-2">
								<span>✍️</span>
								<span>Everyone crafts their wittiest caption</span>
							</li>
							<li className="flex items-center space-x-2">
								<span>🎭</span>
								<span>Captions are revealed anonymously</span>
							</li>
							<li className="flex items-center space-x-2">
								<span>🗳️</span>
								<span>Vote for the best (not your own!)</span>
							</li>
							<li className="flex items-center space-x-2">
								<span>🏆</span>
								<span>Earn points and climb to victory</span>
							</li>
						</ol>
					</div>
					<div>
						<h3 className="text-xl font-bold text-game-primary mb-3">
							Pro Tips
						</h3>
						<ul className="space-y-2 text-gray-700">
							<li className="flex items-center space-x-2">
								<span>💡</span>
								<span>Think outside the box - unexpected is funny!</span>
							</li>
							<li className="flex items-center space-x-2">
								<span>⚡</span>
								<span>Timing and context make captions pop</span>
							</li>
							<li className="flex items-center space-x-2">
								<span>🎯</span>
								<span>Inside jokes can be gold (if everyone gets them)</span>
							</li>
							<li className="flex items-center space-x-2">
								<span>🤝</span>
								<span>Keep it fun and appropriate for your crew</span>
							</li>
						</ul>
					</div>
				</div>
			</Modal>

			<div
				className={`game-card transition-all duration-500 ${
					isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
				}`}
			>
				<div className="game-logo mb-6">
					<Logo size="xl" />
				</div>

				<h2 className="text-2xl text-center mb-8 text-game-neutral font-light">
					Where memes meet wit, and laughter knows no bounds! 🎭
				</h2>

				{error && (
					<div className="animate-fade-in bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-6 text-center">
						{error}
					</div>
				)}

				<div className="space-y-8">
					<div className="space-y-6">
						<div className="form-control">
							<label className="label">
								<span className="label-text text-lg">Your Name</span>
							</label>
							<input
								type="text"
								placeholder="What shall we call you?"
								className="input input-bordered w-full text-lg py-4"
								value={playerName}
								onChange={handlePlayerNameChange}
								maxLength={20}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<button
								className="game-button btn-primary"
								onClick={handleCreateGame}
								disabled={!playerName.trim()}
							>
								Create Room
							</button>
							<button
								className="game-button btn-secondary"
								onClick={() => setShowJoinForm(true)}
								disabled={!playerName.trim()}
							>
								Join Room
							</button>
						</div>

						<div className="text-center pt-4">
							<button
								className="text-game-secondary hover:underline text-lg group inline-flex items-center"
								onClick={() => setShowHowToPlay(true)}
							>
								<span className="opacity-0 group-hover:opacity-100 mr-1">
									🎮
								</span>
								How to Play
							</button>
						</div>
					</div>
				</div>
			</div>

			<Modal
				isOpen={showJoinForm}
				onClose={() => setShowJoinForm(false)}
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
