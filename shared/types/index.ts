// Player interface
export interface Player {
	id: string;
	name: string;
	score: number;
	isHost: boolean;
	isConnected: boolean;
}

// Game room interface
export interface Room {
	id: string;
	name: string;
	players: Player[];
	currentRound: number;
	totalRounds: number;
	status: 'waiting' | 'playing' | 'voting' | 'results' | 'ended';
	createdAt: Date;
}

// Meme interface
export interface Meme {
	id: string;
	imageUrl: string;
	altText?: string;
}

// Response interface
export interface Response {
	id: string;
	playerId: string;
	memeId: string;
	caption: string;
	votes: string[]; // Array of player IDs who voted for this response
}

// Round interface
export interface Round {
	id: string;
	roomId: string;
	roundNumber: number;
	meme: Meme;
	responses: Response[];
	status: 'waiting' | 'responding' | 'voting' | 'results';
	startTime: Date;
	endTime?: Date;
}

// Game state interface
export interface GameState {
	room: Room;
	currentRound?: Round;
	previousRounds: Round[];
}

// Socket event types
export enum SocketEvents {
	JOIN_ROOM = 'join_room',
	LEAVE_ROOM = 'leave_room',
	CREATE_ROOM = 'create_room',
	START_GAME = 'start_game',
	SUBMIT_CAPTION = 'submit_caption',
	SUBMIT_VOTE = 'submit_vote',
	ROOM_UPDATE = 'room_update',
	ROUND_UPDATE = 'round_update',
	GAME_ERROR = 'game_error',
	PLAYER_JOINED = 'player_joined',
	PLAYER_LEFT = 'player_left',
}
