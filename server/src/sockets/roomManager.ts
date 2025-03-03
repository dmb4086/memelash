import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

// Types
export interface Player {
	id: string;
	name: string;
	isHost: boolean;
	socketId: string;
	avatar?: string;
	emoji?: string;
}

export interface GameRoom {
	code: string;
	players: Player[];
	hostSocketId: string;
	createdAt: Date;
	status: 'waiting' | 'playing' | 'ended';
	maxPlayers: number;
}

// In-memory storage for rooms
const rooms: Record<string, GameRoom> = {};

// Add at the top of the file
const isDevelopment = process.env.NODE_ENV === 'development';

// Modified log formatter
const formatLog = (logData: Record<string, unknown>) => {
	return isDevelopment
		? JSON.stringify(logData, null, 2) // Pretty print for dev
		: JSON.stringify(logData); // Compact for production
};

// Add this above the setInterval block
const getOperationalMetrics = () => {
	const memoryUsage = process.memoryUsage();
	return {
		memory: {
			rss: memoryUsage.rss / 1024 / 1024, // MB
			heapTotal: memoryUsage.heapTotal / 1024 / 1024,
			heapUsed: memoryUsage.heapUsed / 1024 / 1024,
			external: memoryUsage.external / 1024 / 1024,
		},
		rooms: Object.keys(rooms).length,
		totalPlayers: Object.values(rooms).reduce(
			(acc, room) => acc + room.players.length,
			0
		),
		uptime: process.uptime(),
	};
};

// Add this periodic logging
setInterval(() => {
	const metrics = getOperationalMetrics();
	console.log(
		formatLog({
			severity: 'INFO',
			timestamp: new Date().toISOString(),
			service: 'room-manager',
			type: 'ops_metrics',
			...metrics,
		})
	);
}, 30000); // Every 30 seconds

// Generate a unique room code (4 characters, alphanumeric)
const generateRoomCode = (): string => {
	const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking characters
	let code = '';

	// Generate a 4-character code
	for (let i = 0; i < 4; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		code += characters[randomIndex];
	}

	// Check if code already exists, regenerate if needed
	return rooms[code] ? generateRoomCode() : code;
};

// Initialize socket handlers
export const initializeRoomManager = (io: Server) => {
	io.on('connection', (socket: Socket) => {
		const connectionMetrics = {
			socketId: socket.id,
			...getOperationalMetrics(),
		};

		console.log(
			formatLog({
				severity: 'INFO',
				timestamp: new Date().toISOString(),
				service: 'room-manager',
				type: 'socket_connected',
				...connectionMetrics,
			})
		);

		// Create a new game room
		socket.on('create_room', ({ playerName, emoji, maxPlayers = 8 }) => {
			const logPayload = {
				type: 'room_create',
				socketId: socket.id,
				playerName,
				initialEmoji: emoji,
				maxPlayers,
				metrics: getOperationalMetrics(),
			};

			console.log(
				formatLog({
					severity: 'INFO',
					timestamp: new Date().toISOString(),
					service: 'room-manager',
					...logPayload,
				})
			);

			console.log(
				`[CREATE] ${socket.id} | Name:${playerName} | Emoji:${
					emoji || 'none'
				} | Max:${maxPlayers}`
			);
			try {
				const roomCode = generateRoomCode();
				console.log(`Generated room code: ${roomCode}`);

				// Create host player
				const host: Player = {
					id: socket.id,
					name: playerName,
					isHost: true,
					socketId: socket.id,
					avatar: `avatar-${Math.floor(Math.random() * 8) + 1}`, // Random avatar 1-8
					emoji: emoji || '', // No default emoji, host will select in lobby
				};

				// Create new room
				const newRoom: GameRoom = {
					code: roomCode,
					players: [host],
					hostSocketId: socket.id,
					createdAt: new Date(),
					status: 'waiting',
					maxPlayers,
				};

				// Store room in memory
				rooms[roomCode] = newRoom;

				// Join socket to room
				socket.join(roomCode);
				console.log(`Socket ${socket.id} joined room ${roomCode}`);

				// Send room info back to client
				socket.emit('room_created', {
					roomCode,
					player: host,
					isHost: true,
				});
				console.log(`Emitted room_created event to ${socket.id}`);

				console.log(`Room created: ${roomCode} by ${playerName}`);

				// After room creation
				const postCreateMetrics = {
					roomCode,
					newRoomState: {
						players: 1,
						maxPlayers,
						hostId: socket.id,
					},
					metrics: getOperationalMetrics(),
				};

				console.log(
					formatLog({
						severity: 'INFO',
						timestamp: new Date().toISOString(),
						service: 'room-manager',
						type: 'room_created',
						...postCreateMetrics,
					})
				);
			} catch (error) {
				console.error('Error creating room:', error);
				socket.emit('error', { message: 'Failed to create room' });
			}
		});

		// Join an existing game room
		socket.on('join_room', ({ roomCode, playerName, emoji }) => {
			try {
				console.log(
					`[JOIN] ${socket.id} | Attempting ${roomCode} as "${playerName}" (${emoji})`
				);
				const room = rooms[roomCode];

				// Enhanced validation
				if (!room) {
					console.log(`[REJECT] Room ${roomCode} not found for ${socket.id}`);
					socket.emit('error', { message: 'Room not found' });
					return;
				}

				// Check for existing emoji before joining
				const isEmojiTaken = room.players.some((p) => p.emoji === emoji);
				if (isEmojiTaken) {
					console.log(`[REJECT] Emoji ${emoji} already taken in ${roomCode}`);
					socket.emit('game_error', {
						message: 'Emoji already taken. Please choose another one.',
						type: 'EMOJI_CONFLICT',
					});
					return;
				}

				console.log(
					`Player ${playerName} attempting to join room ${roomCode} with emoji ${emoji}`
				);

				// Create the new player
				const newPlayer = {
					id: uuidv4(),
					name: playerName,
					socketId: socket.id,
					emoji: emoji || '😊', // Default emoji if none provided
					score: 0,
					isHost: false,
					// Other player properties
				};

				// Add player to room
				room.players.push(newPlayer);

				// Join the socket room
				socket.join(roomCode);

				// Log all players in the room for debugging
				console.log(
					`[ROOM:${roomCode}] Player joined: ${playerName} (ID:${newPlayer.id.slice(
						-4
					)}) Emoji:${emoji}`
				);
				console.debug(
					`[ROOM:${roomCode}] Current players: ${room.players
						.map(
							(p) =>
								`${p.name}[${p.id.slice(-4)}]:${p.emoji}${
									p.isHost ? '(H)' : ''
								}`
						)
						.join(', ')}`
				);

				// Emit full room data to all clients with complete emoji list
				const usedEmojis = room.players
					.map((player) => player.emoji)
					.filter(Boolean);

				// Send room update to everyone
				io.to(roomCode).emit('room_update', {
					roomCode,
					players: room.players,
					// Other room data
				});

				// Make sure everyone gets the updated emoji list
				io.to(roomCode).emit('used_emojis', {
					emojis: usedEmojis,
				});

				// Send player_joined notification to all other players in the room
				socket.to(roomCode).emit('player_joined', {
					players: room.players,
					player: newPlayer,
					allPlayers: room.players,
				});

				// Respond to the joining player
				socket.emit('room_joined', {
					roomCode,
					player: newPlayer,
					players: room.players,
					isHost: false,
					usedEmojis: usedEmojis,
					// Other room data
				});
			} catch (error) {
				console.error('Error joining room:', error);
				socket.emit('error', { message: 'Failed to join room' });
			}
		});

		// Check room and get used emojis
		socket.on('check_room', ({ roomCode }) => {
			console.log(
				`[DEBUG] Checking room ${roomCode} request from ${socket.id}`
			);
			const room = rooms[roomCode];

			if (room) {
				console.log(
					`[DEBUG] Room ${roomCode} exists with ${room.players.length} players`
				);
				console.log(
					`[DEBUG] Current emojis: ${room.players
						.map((p) => p.emoji)
						.join(', ')}`
				);
				socket.emit('room_checked', {
					exists: true,
					usedEmojis: room.players.map((p) => p.emoji).filter(Boolean),
					playerCount: room.players.length,
				});
			} else {
				console.log(`[DEBUG] Room ${roomCode} does NOT exist`);
				socket.emit('room_checked', { exists: false });
			}
		});

		// Update player's spirit animal
		socket.on('update_spirit_animal', ({ roomCode, playerId, emoji }) => {
			console.log(
				`[EMOJI] ${socket.id} | Room:${roomCode} | Player:${playerId.slice(
					-4
				)} | New:${emoji}`
			);

			if (!roomCode || !rooms[roomCode]) {
				console.error('Invalid room code during spirit animal update');
				return;
			}

			const room = rooms[roomCode];
			const player = room.players.find((p) => p.id === playerId);

			if (!player) {
				console.error(`Player ${playerId} not found in room ${roomCode}`);
				return;
			}

			// Check for emoji conflicts within the room
			if (room.players.some((p) => p.emoji === emoji && p.id !== playerId)) {
				console.log(`[REJECT] Emoji ${emoji} conflict in ${roomCode}`);
				socket.emit('game_error', {
					message: 'This emoji is already taken by another player',
					type: 'EMOJI_CONFLICT',
				});
				return;
			}

			console.log(
				`[ROOM:${roomCode}] Updated ${player.name}'s emoji ${player.emoji}→${emoji}`
			);
			player.emoji = emoji;

			// Force immediate room update
			io.to(roomCode).emit('room_update', {
				roomCode,
				players: room.players,
				usedEmojis: room.players.map((p) => p.emoji).filter(Boolean),
			});
		});

		// Handle disconnections
		socket.on('disconnect', () => {
			const disconnectMetrics = {
				type: 'socket_disconnected',
				socketId: socket.id,
				rooms: Array.from(socket.rooms),
				metrics: getOperationalMetrics(),
			};

			console.log(
				formatLog({
					severity: 'INFO',
					timestamp: new Date().toISOString(),
					service: 'room-manager',
					...disconnectMetrics,
				})
			);

			console.log(
				`[DISCONNECT] ${socket.id} | Rooms:${Array.from(socket.rooms).join(
					','
				)}`
			);

			// Find rooms where this socket is a player
			Object.entries(rooms).forEach(([roomCode, room]) => {
				const playerIndex = room.players.findIndex(
					(p) => p.socketId === socket.id
				);

				if (playerIndex !== -1) {
					const isHost = room.players[playerIndex].isHost;

					// Remove player from room
					room.players.splice(playerIndex, 1);

					if (isHost || room.players.length === 0) {
						console.log(
							`[ROOM:${roomCode}] Closed | Reason:${
								isHost ? 'Host left' : 'Empty'
							} | Players:${room.players.length}`
						);
						delete rooms[roomCode];
						io.to(roomCode).emit('room_closed', {
							message: 'Host left the game',
						});
						console.log(`Room ${roomCode} closed: host left or room empty`);

						// Room closure logging
						const roomClosureLog = (roomCode: string, reason: string) => {
							const room = rooms[roomCode];
							const duration = Date.now() - room.createdAt.getTime();

							console.log(
								formatLog({
									severity: 'WARNING',
									timestamp: new Date().toISOString(),
									service: 'room-manager',
									type: 'room_closed',
									roomCode,
									reason,
									lifetime: duration,
									finalPlayers: room.players.length,
									metrics: getOperationalMetrics(),
								})
							);
						};
					} else {
						// Notify remaining players
						io.to(roomCode).emit('player_left', {
							players: room.players,
						});
						console.log(
							`[ROOM:${roomCode}] Player left | Remaining:${room.players.length}`
						);
					}
				}
			});
		});
	});
};

// Export utility functions for testing
export const getRooms = () => rooms;
export const getRoom = (code: string) => rooms[code];
export const clearRooms = () =>
	Object.keys(rooms).forEach((key) => delete rooms[key]);
