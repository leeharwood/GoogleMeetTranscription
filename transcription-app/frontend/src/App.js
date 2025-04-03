import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [meetingUrl, setMeetingUrl] = useState('');
  const [transcripts, setTranscripts] = useState([]);
  const [status, setStatus] = useState('');

  const fetchTranscripts = async () => {
    const { data } = await axios.get('http://localhost:5000/api/transcripts');
    setTranscripts(data);
  };

  const startTranscription = async () => {
    setStatus('Starting...');
    try {
      const { data } = await axios.post('http://localhost:5000/api/start-transcription', { 
        meetingUrl 
      });
      setStatus(`Success! Bot ID: ${data.botId}. Admit it to the meeting.`);
      
      // Poll for new transcripts every 2 seconds
      setInterval(fetchTranscripts, 2000);
    } catch (error) {
      setStatus('Error: ' + error.message);
    }
  };

  return (
    <div className="App">
      <h1>Google Meet Transcriber</h1>
      <input
        type="text"
        value={meetingUrl}
        onChange={(e) => setMeetingUrl(e.target.value)}
        placeholder="Paste Google Meet URL"
      />
      <button onClick={startTranscription}>Start Transcription</button>
      
      <p>{status}</p>
      
      <div className="transcripts">
        {transcripts.map((t, i) => (
          <p key={i}><strong>{t.speaker}:</strong> {t.text}</p>
        ))}
      </div>
    </div>
  );
}

export default App;