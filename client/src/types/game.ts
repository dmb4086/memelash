export interface Player {
	id: string;
	name: string;
	isHost: boolean;
	socketId: string;
	avatar?: string;
	emoji?: string;
}

export interface RoomJoinedPayload {
	roomCode: string;
	player: Player;
	players: Player[];
	usedEmojis: string[];
}

export interface PlayerJoinedPayload {
	players: Player | Player[];
	player: Player;
	allPlayers: Player[];
}
