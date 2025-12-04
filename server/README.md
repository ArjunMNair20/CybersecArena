# AI Chatbot Backend Server

This backend server provides an AI-powered chatbot using a local LLM (Large Language Model) for the CyberSec Arena application.

## Features

- **Local LLM**: Uses `@xenova/transformers` to run AI models locally without external API dependencies
- **Cybersecurity-focused**: Pre-configured with cybersecurity knowledge and context
- **Session Management**: Maintains chat history per session
- **Fallback System**: Includes keyword-based responses if the model fails to load

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Start the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:3001` by default.

## API Endpoints

### POST `/api/chat`
Send a message to the chatbot.

**Request Body:**
```json
{
  "message": "What is SQL injection?",
  "sessionId": "optional-session-id"
}
```

**Response:**
```json
{
  "response": "SQL Injection is a security vulnerability...",
  "sessionId": "session-id"
}
```

### GET `/api/health`
Check server and model status.

**Response:**
```json
{
  "status": "ok",
  "modelLoaded": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### POST `/api/chat/clear`
Clear chat history for a session.

**Request Body:**
```json
{
  "sessionId": "session-id"
}
```

## Model Information

The server uses `Xenova/Qwen2.5-0.5B-Instruct`, a small but capable model optimized for local inference. On first run, the model will be downloaded automatically (approximately 500MB).

### Model Loading

- First run: Model download and initialization may take 1-2 minutes
- Subsequent runs: Model loads from cache (usually 10-30 seconds)
- Memory usage: Approximately 1-2GB RAM

### Alternative Models

You can modify the model in `server/index.js` to use different models:
- `Xenova/Qwen2.5-1.5B-Instruct` - Larger, more capable (requires more RAM)
- `Xenova/Phi-3-mini-4k-instruct` - Microsoft's efficient model
- `Xenova/TinyLlama-1.1B-Chat-v1.0` - Very lightweight option

## Troubleshooting

### Model fails to load
- Check internet connection (required for first-time download)
- Ensure sufficient disk space (at least 2GB free)
- Check Node.js version (requires Node.js 18+)

### Slow responses
- The model runs on CPU by default. For faster inference, consider:
  - Using a GPU-enabled version (requires additional setup)
  - Using a smaller model
  - Increasing system RAM

### Port already in use
- Change the PORT environment variable: `PORT=3002 npm start`
- Or kill the process using port 3001

## Environment Variables

- `PORT`: Server port (default: 3001)

## Notes

- Chat history is stored in-memory and will be lost on server restart
- For production, consider implementing persistent storage (database)
- The fallback response system ensures the chatbot always responds, even if the model isn't loaded

