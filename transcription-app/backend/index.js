require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Configuration - ONLY us-west-2
const RECALL_CONFIG = {
  API_ENDPOINT: 'https://us-west-2.recall.ai/api/v1/bot',
  API_KEY: process.env.RECALL_API_KEY || '80c34b34e4c9954e7bf68ca641a341a505706c2a' // not best practice- but i found this to improve the speed of the transcription
};

// Verify configuration on startup
if (!RECALL_CONFIG.API_KEY) {
  console.error('ERROR: Missing RECALL_API_KEY in .env file');
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// Transcript storage
const transcripts = [];

// Webhook endpoint
app.post('/api/webhook/recall/transcript', (req, res) => {
  try {
    const { event, data } = req.body;
    
    if (event === 'transcript.data') {
      const speaker = data.data.participant?.name || `Speaker ${data.data.participant?.id}`;
      const text = data.data.words.map(w => w.text).join(' ');
      
      transcripts.push({
        speaker,
        text,
        timestamp: new Date().toISOString()
      });
      
      console.log(`[Transcript] ${speaker}: ${text}`);
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).send('Webhook processing failed');
  }
});

// Start transcription endpoint
app.post('/api/start-transcription', async (req, res) => {
  const { meetingUrl } = req.body;

  // Validation
  if (!meetingUrl) {
    return res.status(400).json({ error: 'Meeting URL is required' });
  }

  if (!meetingUrl.includes('meet.google.com')) {
    return res.status(400).json({ error: 'Invalid Google Meet URL' });
  }

  try {
    console.log(`Creating bot for meeting: ${meetingUrl}`);
    
    const response = await axios.post(
      RECALL_CONFIG.API_ENDPOINT,
      {
        meeting_url: meetingUrl,
        recording_config: {
          transcript: { provider: { meeting_captions: {} } },
          realtime_endpoints: [{
            type: "webhook",
            url: "https://troops-pb-industry-issn.trycloudflare.com/api/webhook/recall/transcript",
            events: ["transcript.data"]
          }]
        }
      },
      {
        headers: {
          'Authorization': `Token ${RECALL_CONFIG.API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      }
    );

    console.log('Bot created successfully:', response.data.id);
    
    res.json({
      success: true,
      botId: response.data.id,
      message: "Bot created! Please admit it to your Google Meet meeting."
    });

  } catch (error) {
    console.error('API Request Failed:', {
      url: RECALL_CONFIG.API_ENDPOINT,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    let errorMessage = 'Failed to start transcription';
    if (error.response?.data?.detail) {
      errorMessage += `: ${error.response.data.detail}`;
    }
    
    res.status(500).json({
      error: errorMessage,
      details: error.response?.data || error.message
    });
  }
});

// Get transcripts
app.get('/api/transcripts', (req, res) => {
  res.json(transcripts);
});

// Start server
app.listen(PORT, () => {
  console.log(`
  Server running on port ${PORT}
  Recall Endpoint: ${RECALL_CONFIG.API_ENDPOINT}
  Webhook URL: https://troops-pb-industry-issn.trycloudflare.com/api/webhook/recall/transcript
  `);
  
  // Masked API key verification
  if (RECALL_CONFIG.API_KEY) {
    console.log('API Key Verified (last 4 chars):', '••••' + RECALL_CONFIG.API_KEY.slice(-4));
  }
});