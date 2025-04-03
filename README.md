# Google Meet Transcription
A full-stack application that provides real-time transcription for Google Meet meetings using Recall.ai's API, with speaker identification and persistent transcript storage.

## Features

- **Real-time transcription** from Google Meet meetings
- **Speaker identification** (names or Speaker IDs)
- **Transcript storage** (in-memory or JSON file)
- **Webhook integration** via Cloudflare Tunnel
- **Simple React frontend** to view live transcripts

## Prerequisites

- Node.js 
- Recall.ai API key (us-west-2 region)
- Google Meet account
- Cloudflare account (for webhook tunneling)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/recall-ai-transcriber.git
   cd recall-ai-transcriber
   ```

2. **Set up backend**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Add your Recall.ai API key to .env
   ```

3. **Set up frontend**
   ```bash
   cd ../client
   npm install
   ```

## Configuration

### Environment Variables (`server/.env`)
```
RECALL_API_KEY=your_recall_ai_api_key
PORT=5000
```

### Cloudflare Tunnel
```bash
# Install cloudflared (if not installed)
npm install -g cloudflared

# Run tunnel (from server directory)
cloudflared tunnel --url http://localhost:5000
```

## Usage

1. **Start the backend**
   ```bash
   cd server
   node index.js
   ```

2. **Start the frontend**
   ```bash
   cd ../client
   npm start
   ```

3. **Start transcription**
   - Open `http://localhost:3000`
   - Enter Google Meet URL
   - Click "Start Transcription"
   - **Admit the Recall Bot** when it joins your meeting

4. **View transcripts**
   - Live transcripts appear in the browser
   - Full transcripts saved to `server/transcripts.json`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/start-transcription` | POST | Starts transcription (requires `meetingUrl`) |
| `/api/transcripts` | GET | Returns all collected transcripts |
| `/api/webhook/recall/transcript` | POST | Recall.ai webhook endpoint |

## File Structure

```
.
├── client/                  # React frontend
│   ├── public/
│   ├── src/
│   └── package.json
├── server/                  # Node.js backend
│   ├── transcripts.json     # Transcript storage
│   ├── index.js             # Main server file
│   └── package.json
└── README.md
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 401 API Error | Verify Recall.ai API key and region |
| Bot not transcribing | Ensure you admitted the bot to the meeting |
| No webhook data | Check Cloudflare tunnel is running |
| Missing transcripts.json | Create file or grant write permissions |
