# CyberSec Arena

A unified AI-powered cybersecurity game hub with a sleek neon hacker theme. Built with Vite + React + TypeScript + Tailwind. Desktop mode provided via Electron for a native-like experience.

## Features (MVP Scaffold)
- Dashboard with progress stub, quick links to modes
- Game modes pages:
  - Capture The Flag (Web, Crypto, Forensics, Reverse, Binary)
  - Phish Hunt
  - Code & Secure
  - Firewall Defender
  - AI Cyber QuizBot
  - **AI Chatbot** - Local LLM-powered cybersecurity assistant
- Leaderboard, News Feed, Tutorials, Profile pages
- Ambient audio control (WebAudio drone) and neon theme

## Getting Started

### Frontend Setup
1. Install dependencies
   ```bash
   npm install
   ```
2. Run web dev server
   ```bash
   npm run dev
   ```

### AI Chatbot Backend Setup
The AI chatbot requires a separate backend server with a local LLM:

1. Navigate to the server directory
   ```bash
   cd server
   ```

2. Install backend dependencies
   ```bash
   npm install
   ```

3. Start the backend server
   ```bash
   npm start
   ```
   The server will run on `http://localhost:3001`

4. **First-time setup**: The AI model will be downloaded automatically on first run (approximately 500MB). This may take a few minutes.

### Running Both Frontend and Backend Together
To run both the frontend and backend simultaneously:
```bash
npm run dev:full
```

### Optional: Desktop mode (Electron)
```bash
npm run dev:desktop
```

> **Note**: Make sure the backend server is running before using the chatbot. The chatbot will show a connection status indicator.

## Next Steps
- Implement real gameplay mechanics per mode
- Add Supabase for auth, profiles, progress, leaderboard, and news fetch
- Add AI Quiz logic and explanations
- Add persistent settings (audio, theme), achievements, and badges

## Tech
- **Frontend**: React 18, TypeScript, Vite 5, Tailwind CSS
- **Backend**: Node.js, Express.js, @xenova/transformers (Local LLM)
- **Desktop**: Electron (dev only, simple launcher)

## AI Chatbot

The application includes an AI-powered chatbot that uses a local Large Language Model (LLM) to answer cybersecurity questions. The chatbot:

- Runs completely locally (no external API calls)
- Answers questions about CTF challenges, secure coding, network security, and more
- Maintains conversation context within each session
- Includes a fallback system if the model fails to load

See [server/README.md](server/README.md) for detailed backend documentation.
