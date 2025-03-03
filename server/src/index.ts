// Basic server entry point
console.log('MemeLash server starting...');

// This file will be expanded with Express and Socket.io setup
// when we install the dependencies

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { initializeRoomManager } from './sockets/roomManager';

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

console.log(`Setting up server on port ${PORT}...`);

// Middleware
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
console.log('Initializing Socket.IO...');
const io = new Server(server, {
	cors: {
		origin:
			process.env.NODE_ENV === 'production'
				? 'https://memelash.com'
				: 'http://localhost:3000',
		methods: ['GET', 'POST'],
	},
});

// Initialize socket handlers
console.log('Setting up socket handlers...');
initializeRoomManager(io);

// Basic route
app.get('/', (req, res) => {
	res.send('MemeLash API is running');
});

// Start server
server.listen(PORT, () => {
	console.log(`MemeLash server running on port ${PORT}`);
	console.log(`Socket.IO server is ready to accept connections`);
});

// Add error handling
server.on('error', (error) => {
	console.error('Server error:', error);
});

process.on('uncaughtException', (error) => {
	console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
	console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
