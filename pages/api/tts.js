import crypto from 'crypto';
import { connectToDatabase } from '../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, storyId } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    // Generate hash of the text content for caching
    const textHash = crypto.createHash('md5').update(text).digest('hex');
    
    // Check if audio already exists in database
    if (storyId) {
      const { db } = await connectToDatabase();
      const audioCollection = db.collection('story_audio');
      
      const existingAudio = await audioCollection.findOne({
        storyId: storyId,
        textHash: textHash,
        voiceId: 'Crm8VULvkVs5ZBDa1Ixm'
      });
      
      if (existingAudio) {
        console.log('Using cached audio for story:', storyId);
        return res.json({
          audio: existingAudio.audioData,
          mimeType: existingAudio.mimeType,
          cached: true
        });
      }
    }
    
    // Generate new audio
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    // Andrea Wolff voice ID from memory
    const voiceId = 'Crm8VULvkVs5ZBDa1Ixm';
    
    // TTS settings from memory
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.85,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('ElevenLabs API error:', errorData);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    // Get audio data and convert to base64
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    
    // Save to database if storyId provided
    if (storyId) {
      const { db } = await connectToDatabase();
      const audioCollection = db.collection('story_audio');
      
      await audioCollection.insertOne({
        storyId: storyId,
        textHash: textHash,
        audioData: base64Audio,
        mimeType: 'audio/mpeg',
        voiceId: voiceId,
        voiceSettings: {
          stability: 0.75,
          similarity_boost: 0.85,
          use_speaker_boost: true,
        },
        createdAt: new Date(),
        fileSize: base64Audio.length
      });
      
      console.log('Saved audio for story:', storyId);
    }
    
    // Return base64 audio data for browser playback
    res.json({ 
      audio: base64Audio,
      mimeType: 'audio/mpeg',
      cached: false
    });
    
  } catch (error) {
    console.error('TTS generation failed:', error);
    res.status(500).json({ 
      error: 'Failed to generate audio',
      details: error.message 
    });
  }
}