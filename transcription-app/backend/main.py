from fastapi import FastAPI, WebSocket
import requests
import os
from dotenv import load_dotenv

load_dotenv()  # Load API key from .env file

app = FastAPI()

# Get API key from .env
RECALL_API_KEY = os.getenv("RECALL_API_KEY")

@app.get("/")
def home():
    return {"message": "Google Meet Transcription App"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    session_id = "your_session_id"  # Replace with actual session ID

    while True:
        response = requests.get(
            f"https://api.recall.ai/transcription/{session_id}",
            headers={"Authorization": f"Bearer {RECALL_API_KEY}"}
        )
        
        data = response.json()
        transcript = data.get("transcript", "")
        speaker = data.get("speaker", "Unknown")
        
        # Send the transcript to frontend
        await websocket.send_json({"speaker": speaker, "text": transcript})
