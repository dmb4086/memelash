import React, { useState, useEffect } from 'react';
import Logo from './ui/Logo';
import Confetti from './ui/Confetti';
import Modal from './ui/Modal';

const StartScreen: React.FC = () => {
	const [playerName, setPlayerName] = useState('');
	const [roomCode, setRoomCode] = useState('');
	const [showJoinForm, setShowJoinForm] = useState(false);
	const [showConfetti, setShowConfetti] = useState(false);
	const [showHowToPlay, setShowHowToPlay] = useState(false);
	const [isLoaded, setIsLoaded] = useState(false);

	// Animation effect when component mounts
	useEffect(() => {
		const timer = setTimeout(() => {
			setIsLoaded(true);
		}, 300);
		return () => clearTimeout(timer);
	}, []);

	const handleCreateGame = () => {
		// Will be implemented later with backend
		console.log('Creating game with player:', playerName);
		// Show confetti effect when creating a game
		setShowConfetti(true);
		setTimeout(() => setShowConfetti(false), 3000);
	};

	const handleJoinGame = () => {
		// Will be implemented later with backend
		console.log('Joining game with code:', roomCode, 'and player:', playerName);
	};

	return (
		<div className="game-container">
			{/* Background pattern */}
			<div className="fixed inset-0 opacity-10 z-0">
				<div
					className="absolute inset-0 bg-repeat"
					style={{
						backgroundImage:
							"url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
					}}
				></div>
			</div>

			{/* Confetti effect */}
			<Confetti active={showConfetti} count={100} />

			{/* How to Play Modal */}
			<Modal
				isOpen={showHowToPlay}
				onClose={() => setShowHowToPlay(false)}
				title="How to Play MemeLash"
			>
				<div className="space-y-4">
					<p className="font-medium">
						MemeLash is a party game where you compete to write the funniest
						captions for memes!
					</p>

					<div className="space-y-2">
						<h4 className="font-bold text-game-secondary">Game Flow:</h4>
						<ol className="list-decimal list-inside space-y-1">
							<li>Create a game room or join an existing one</li>
							<li>Each round, you'll see a meme image</li>
							<li>Write your funniest caption for the meme</li>
							<li>Vote for your favorite captions (not your own!)</li>
							<li>Earn points when others vote for your captions</li>
							<li>After all rounds, the player with the most points wins!</li>
						</ol>
					</div>

					<div className="space-y-2">
						<h4 className="font-bold text-game-primary">Tips:</h4>
						<ul className="list-disc list-inside space-y-1">
							<li>Be creative and think outside the box</li>
							<li>Timing and context can make a caption funnier</li>
							<li>Inside jokes work well if everyone gets them</li>
							<li>Keep it appropriate for your group</li>
						</ul>
					</div>
				</div>
			</Modal>

			<div
				className={`game-card transition-all duration-500 ${
					isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
				}`}
			>
				<div className="game-logo">
					<Logo size="xl" />
				</div>

				<h2 className="text-2xl text-center mb-6 text-game-neutral">
					If Quiplash and What Do You Meme had a baby, it would be this.
				</h2>

				{!showJoinForm ? (
					// Main menu
					<>
						<div className="form-control mb-6">
							<input
								type="text"
								placeholder="Your Name"
								className="game-input"
								value={playerName}
								onChange={(e) => setPlayerName(e.target.value)}
							/>
						</div>

						<button
							className="game-button btn-primary"
							onClick={handleCreateGame}
							disabled={!playerName}
						>
							Create New Game
						</button>

						<button
							className="game-button btn-secondary"
							onClick={() => setShowJoinForm(true)}
							disabled={!playerName}
						>
							Join Game
						</button>

						<div className="divider">OR</div>

						<button
							className="game-button btn-accent"
							onClick={() => setShowHowToPlay(true)}
						>
							How To Play
						</button>
					</>
				) : (
					// Join game form
					<>
						<div className="form-control mb-6">
							<input
								type="text"
								placeholder="Room Code"
								className="game-input"
								value={roomCode}
								onChange={(e) => setRoomCode(e.target.value)}
							/>
						</div>

						<button
							className="game-button btn-primary"
							onClick={handleJoinGame}
							disabled={!roomCode || !playerName}
						>
							Join Game
						</button>

						<button
							className="game-button btn-outline"
							onClick={() => setShowJoinForm(false)}
						>
							Back
						</button>
					</>
				)}

				<div className="mt-8 text-center text-sm text-gray-500">
					<p>No account needed! Just add your name and play.</p>
					<p className="mt-2">© 2025 OneCard Inc.</p>
				</div>
			</div>
		</div>
	);
};

export default StartScreen;
