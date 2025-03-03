# MemeLash

> _MemeLash_ is a real-time multiplayer game that combines the humor of _Quiplash_ and _What Do You Meme_. Players join game rooms, compete to write the funniest captions for random meme images, vote on their favorites, and earn points based on votes. Designed for quick, casual fun, it’s built to run smoothly on mobile web browsers, making it accessible without requiring a dedicated app.

## Core Features

1. **Real-Time Multiplayer:** Players need to join games, submit responses, and see updates (like votes or scores) instantly across all devices.

2. **Responsive Design:** The game must work smoothly on phones via a web browser, since you want participants to text responses without needing an app.

3. **Game Logic:** Managing meme display, response submission, voting, and scoring requires clean and efficient code.

4. **Scalability:** The system should handle multiple game sessions at once without lagging or crashing.

For an MVP, we can simplify things by focusing only on the core gameplay loop: creating/joining a game room, displaying memes, submitting responses, voting, and showing scores. This keeps the complexity manageable while still delivering a fun experience. With a small, skilled team, this is very achievable.

### Repository Structure

```
memelash/
├── client/               # React frontend
│   ├── public/           # Static assets (e.g., index.html, favicon)
│   ├── src/
│   │   ├── components/   # React components (e.g., MemeCard, VotingPanel)
│   │   ├── contexts/     # WebSocket/game state context (e.g., GameContext)
│   │   ├── services/     # API/Socket.io services (e.g., socketService.ts)
│   │   ├── assets/       # Local images/styles (e.g., CSS, meme placeholders)
│   │   ├── types/        # TypeScript types (if using TS, e.g., Player, Room)
│   │   └── App.tsx       # Main component
│   ├── package.json      # Client dependencies and scripts
│   └── tsconfig.json     # TypeScript configuration (if using TS)
│
├── server/               # Node.js backend
│   ├── src/
│   │   ├── controllers/  # Game logic handlers (e.g., roomController.ts)
│   │   ├── routes/       # REST API endpoints (e.g., /api/rooms)
│   │   ├── models/       # MongoDB schemas (e.g., Room, Response)
│   │   ├── sockets/      # Socket.io handlers (e.g., gameSocket.ts)
│   │   ├── config/       # DB/AWS config (e.g., db.ts, aws.ts)
│   │   └── index.ts      # Server entry point
│   ├── package.json      # Server dependencies and scripts
│   └── tsconfig.json     # TypeScript configuration
│
├── shared/               # Shared code between client/server
│   └── types/            # Shared TypeScript interfaces (e.g., GameState)
│
├── docker/               # Docker configs (optional for MVP)
│   ├── client.Dockerfile # Dockerfile for client
│   └── server.Dockerfile # Dockerfile for server
│
├── .env.example          # Environment variables template (e.g., DB_URI)
├── docker-compose.yml    # For local dev (optional)
├── package.json          # Root scripts for monorepo management
└── README.md             # Project documentation and setup instructions
```

### Key Decisions:

1. **Monorepo Benefits**

   - Single place for issues/PRs
   - Easier to coordinate client/server changes
   - Shared ESLint/Prettier configs

2. **TypeScript Recommended**  
   Add `tsconfig.json` in both client/server for type safety, especially critical for:

   - Game state synchronization
   - Socket.io event payloads
   - API contracts

3. **WebSocket Structure**  
   Create a dedicated `sockets/` directory in the server with:

   - Connection manager
   - Game room handler
   - Event listeners (submit/vote/join)

4. **State Management**  
   Use React Context + useReducer for game state rather than Redux to keep it lightweight

### First Steps to Set Up:

1. Create repo with `main` branch
2. Add basic monorepo structure:

```bash
mkdir your-game-repo
cd your-game-repo
npx create-react-app client --template typescript
mkdir server && cd server && npm init -y
mkdir -p server/src/{controllers,routes,sockets,config}
```

3. Add root-level scripts in `package.json`:

```json
{
	"scripts": {
		"start:client": "cd client && npm start",
		"start:server": "cd server && npm run dev",
		"dev": "concurrently \"npm:start:client\" \"npm:start:server\""
	}
}
```

4. Core dependencies to install immediately:

```bash
# Client
cd client && npm install socket.io-client react-router-dom @types/react-router-dom

# Server
cd server && npm install express socket.io mongoose aws-sdk dotenv
```

Would you like me to elaborate on any specific part of the structure or show example code for critical components like the WebSocket handler or React context setup?
