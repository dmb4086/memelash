import React, {
	createContext,
	useContext,
	useReducer,
	useEffect,
	useRef,
} from 'react';
import { io, Socket } from 'socket.io-client';

// Define types
export interface Player {
	id: string;
	name: string;
	isHost: boolean;
	socketId: string;
	avatar?: string;
	emoji?: string;
}

export interface GameState {
	socket: Socket | null;
	connected: boolean;
	roomCode: string | null;
	playerName: string;
	players: Player[];
	isHost: boolean;
	error: string | null;
	currentPlayer: Player | null;
	usedEmojis: string[];
}

// Define socket event payload types
interface RoomCreatedPayload {
	roomCode: string;
	player: Player;
	isHost: boolean;
}

interface RoomJoinedPayload {
	roomCode: string;
	player: Player;
	isHost: boolean;
	players: Player[];
}

interface PlayerJoinedPayload {
	players: Player[];
	player: Player;
	allPlayers: Player[];
}

interface PlayerLeftPayload {
	players: Player[];
}

interface ErrorPayload {
	message: string;
}

interface UsedEmojisPayload {
	emojis: string[];
}

// Define action types
export type GameActionType =
	| 'CONNECT_SOCKET'
	| 'SOCKET_CONNECTED'
	| 'SOCKET_DISCONNECTED'
	| 'SET_PLAYER_NAME'
	| 'CREATE_ROOM'
	| 'ROOM_CREATED'
	| 'JOIN_ROOM'
	| 'ROOM_JOINED'
	| 'PLAYER_JOINED'
	| 'PLAYER_LEFT'
	| 'SET_ERROR'
	| 'CLEAR_ERROR'
	| 'CHECK_ROOM'
	| 'SET_USED_EMOJIS'
	| 'UPDATE_SPIRIT_ANIMAL'
	| 'ROOM_CLOSED'
	| 'LEAVE_ROOM';

export interface GameAction {
	type: GameActionType;
	payload?: any;
}

// Initial state
const initialState: GameState = {
	socket: null,
	connected: false,
	roomCode: null,
	playerName: '',
	players: [],
	isHost: false,
	error: null,
	currentPlayer: null,
	usedEmojis: [],
};

// Create context
const GameContext = createContext<{
	state: GameState;
	dispatch: React.Dispatch<GameAction>;
}>({
	state: initialState,
	dispatch: () => null,
});

// Reducer function
const gameReducer = (state: GameState, action: GameAction): GameState => {
	console.log('Action:', action.type, action.payload);

	switch (action.type) {
		case 'CONNECT_SOCKET':
			// Only create a new socket if one doesn't exist
			if (!state.socket) {
				const SOCKET_URL =
					process.env.NODE_ENV === 'production'
						? 'https://api.memelash.com'
						: 'http://localhost:3001';

				console.log('Creating new socket connection to:', SOCKET_URL);
				try {
					const socket = io(SOCKET_URL);
					console.log('Socket connection created');
					return { ...state, socket };
				} catch (error) {
					console.error('Error creating socket connection:', error);
					return state;
				}
			}
			return state;

		case 'SOCKET_CONNECTED':
			return { ...state, connected: true };

		case 'SOCKET_DISCONNECTED':
			return { ...state, connected: false };

		case 'SET_PLAYER_NAME':
			return { ...state, playerName: action.payload };

		case 'CREATE_ROOM':
			// Handled by middleware
			return state;

		case 'ROOM_CREATED':
			return {
				...state,
				roomCode: action.payload.roomCode,
				isHost: action.payload.isHost,
				currentPlayer: action.payload.player,
				players: [action.payload.player],
			};

		case 'JOIN_ROOM':
			// Handled by middleware
			return state;

		case 'ROOM_JOINED':
			return {
				...state,
				roomCode: action.payload.roomCode,
				isHost: action.payload.isHost,
				currentPlayer: action.payload.player,
				players: action.payload.players || [],
			};

		case 'PLAYER_JOINED':
			console.log('Player joined action payload:', action.payload);
			return {
				...state,
				players: action.payload.players || [],
				usedEmojis: action.payload.usedEmojis || state.usedEmojis,
			};

		case 'PLAYER_LEFT':
			return {
				...state,
				players: action.payload.players,
			};

		case 'ROOM_CLOSED':
		case 'LEAVE_ROOM':
			// Clean up room state
			return {
				...state,
				roomCode: null,
				players: [],
				isHost: false,
				currentPlayer: null,
			};

		case 'SET_ERROR':
			return { ...state, error: action.payload };

		case 'CLEAR_ERROR':
			return { ...state, error: null };

		case 'CHECK_ROOM':
			// If we have a socket connection, emit the check_room event
			if (state.socket) {
				state.socket.emit('check_room', { roomCode: action.payload });
			}
			return state;

		case 'SET_USED_EMOJIS':
			console.log('Setting used emojis:', action.payload?.emojis || []);
			return {
				...state,
				usedEmojis: action.payload?.emojis || [],
			};

		case 'UPDATE_SPIRIT_ANIMAL':
			if (!state.roomCode || !state.currentPlayer) return state;

			const updatedCurrentPlayer = {
				...state.currentPlayer,
				emoji: action.payload.emoji,
			};

			// Update the player in the players array
			const updatedPlayers = state.players.map((player) =>
				player.id === updatedCurrentPlayer.id ? updatedCurrentPlayer : player
			);

			// Emit the update to the server
			if (state.socket && state.roomCode) {
				console.log(
					'Emitting update_spirit_animal event with emoji:',
					action.payload.emoji
				);
				state.socket.emit('update_spirit_animal', {
					roomCode: state.roomCode,
					playerId: updatedCurrentPlayer.id || state.socket.id,
					emoji: action.payload.emoji,
				});
			} else {
				console.error(
					'Cannot update spirit animal: no room code or socket connection'
				);
			}

			return {
				...state,
				currentPlayer: updatedCurrentPlayer,
				players: updatedPlayers,
			};

		default:
			return state;
	}
};

// Provider component
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [state, dispatch] = useReducer(gameReducer, initialState);
	const dispatchRef = useRef(dispatch);

	// Connect socket when provider mounts
	useEffect(() => {
		console.log('Connecting to socket server...');
		dispatch({ type: 'CONNECT_SOCKET' });
	}, []);

	// Set up socket event listeners
	useEffect(() => {
		if (!state.socket) {
			console.log('No socket connection available');
			return;
		}

		console.log('Setting up socket event listeners');

		// Connection events
		state.socket.on('connect', () => {
			console.log('Socket connected with ID:', state.socket?.id);
			dispatch({ type: 'SOCKET_CONNECTED' });
		});

		state.socket.on('disconnect', () => {
			console.log('Socket disconnected');
			dispatch({ type: 'SOCKET_DISCONNECTED' });
		});

		// Room events
		state.socket.on('room_created', (data: RoomCreatedPayload) => {
			console.log('Room created event received:', data);
			dispatch({ type: 'ROOM_CREATED', payload: data });
		});

		state.socket.on('room_joined', (data: RoomJoinedPayload) => {
			console.log('Joined room:', data);
			console.log('New player:', data.player);
			console.log('All players in room:', data.players);

			const roomData = data as any;
			if (roomData.usedEmojis) {
				console.log('Used emojis:', roomData.usedEmojis);
				dispatch({
					type: 'SET_USED_EMOJIS',
					payload: { emojis: roomData.usedEmojis },
				});
			}

			// Dispatch room joined action
			dispatch({ type: 'ROOM_JOINED', payload: data });
		});

		state.socket.on('player_joined', (data: PlayerJoinedPayload) => {
			console.log('New player joined:', data);
			dispatch({
				type: 'PLAYER_JOINED',
				payload: {
					players: Array.isArray(data.players) ? data.players : [data.players],
					usedEmojis: data.players
						.map((p: Player) => p.emoji)
						.filter(Boolean) as string[],
				},
			});
		});

		state.socket.on('player_left', (data: PlayerLeftPayload) => {
			console.log('Player left event received:', data);
			dispatch({ type: 'PLAYER_LEFT', payload: data });
		});

		state.socket.on('room_closed', () => {
			console.log('Room closed event received');
			dispatch({ type: 'ROOM_CLOSED' });
		});

		state.socket.on('error', (data: ErrorPayload) => {
			console.error('Socket error received:', data.message);
			dispatch({ type: 'SET_ERROR', payload: data.message });

			// Auto-clear error after 5 seconds
			setTimeout(() => {
				dispatch({ type: 'CLEAR_ERROR' });
			}, 5000);
		});

		state.socket.on('used_emojis', (data: UsedEmojisPayload) => {
			console.log('Used emojis received:', data.emojis);
			dispatch({ type: 'SET_USED_EMOJIS', payload: data });
		});

		// Update room_checked handler for clearer logging
		state.socket.on('room_checked', (data) => {
			console.log('Room checked:', data);

			// Log additional details
			console.log(
				`Room exists: ${data.exists}, Player count: ${data.playerCount || 0}`
			);
			console.log('Used emojis in room:', data.usedEmojis || []);

			dispatch({
				type: 'SET_USED_EMOJIS',
				payload: { emojis: data.usedEmojis || [] },
			});
		});

		// Cleanup function
		return () => {
			if (state.socket) {
				console.log('Cleaning up socket event listeners');
				state.socket.off('connect');
				state.socket.off('disconnect');
				state.socket.off('room_created');
				state.socket.off('room_joined');
				state.socket.off('player_joined');
				state.socket.off('player_left');
				state.socket.off('room_closed');
				state.socket.off('error');
				state.socket.off('used_emojis');
			}
		};
	}, [state.socket]);

	// Handle socket-related actions
	useEffect(() => {
		if (!state.socket || !state.connected) {
			console.log('Socket not connected, cannot handle actions');
			return;
		}

		console.log('Setting up socket action handlers');

		// Listen for actions that need to emit socket events
		const handleAction = (action: GameAction) => {
			console.log('Handling action:', action.type, action.payload);

			if (!state.socket) {
				console.error(
					'No socket connection available for action:',
					action.type
				);
				return;
			}

			switch (action.type) {
				case 'CREATE_ROOM':
					console.log(
						'Emitting create_room event with payload:',
						action.payload
					);
					state.socket.emit('create_room', {
						playerName: action.payload.playerName,
						emoji: action.payload.emoji,
					});
					break;
				case 'JOIN_ROOM':
					console.log('Emitting join_room event with payload:', action.payload);
					state.socket.emit('join_room', {
						roomCode: action.payload.roomCode,
						playerName: action.payload.playerName,
						emoji: action.payload.emoji,
					});
					break;
				case 'CHECK_ROOM':
					console.log('Emitting check_room event for room:', action.payload);
					state.socket.emit('check_room', { roomCode: action.payload });
					break;
				case 'UPDATE_SPIRIT_ANIMAL':
					console.log(
						'Emitting update_spirit_animal event with emoji:',
						action.payload
					);
					state.socket.emit('update_spirit_animal', {
						roomCode: state.roomCode,
						playerId: state.currentPlayer?.id || state.socket.id,
						emoji: action.payload.emoji,
					});
					break;
				default:
					break;
			}
		};

		// Set up middleware for socket actions
		const originalDispatch = dispatchRef.current;
		dispatchRef.current = (action: GameAction) => {
			handleAction(action);
			originalDispatch(action);
		};
	}, [state.socket, state.connected]);

	return (
		<GameContext.Provider value={{ state, dispatch: dispatchRef.current }}>
			{children}
		</GameContext.Provider>
	);
};

// Custom hook for using the game context
export const useGame = () => useContext(GameContext);
