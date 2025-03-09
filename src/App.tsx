
import { useState, useEffect, useRef } from 'react'
import './App.css'
import emotionWheel from './assets/wheel-of-emotions.webp'

interface EmotionResponse {
  id: string;
  summary: string;
}

export default function App() {
  const [inputText, setInputText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [wheelRotation, setWheelRotation] = useState<number>(0);
  const [speechUrl, setSpeechUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim()) return;
    
    try {
      setIsProcessing(true);
      setSelectedEmotion(null);
      setSpeechUrl(null);
      
      // Start the wheel spinning animation
      const spinInterval = setInterval(() => {
        setWheelRotation(prev => (prev + 5) % 360);
      }, 50);
      
      // Extract emotions from text
      const emotionResponse = await fetch('https://emorag-arangodb-py-547962548252.us-central1.run.app/extract-emotions/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: inputText })
      });
      
      const emotionData = await emotionResponse.text();
      const emotionId = emotionData.split(':')[1]?.trim().toLowerCase() || 'neutral';
      
      // Simulate processing time to show the wheel spinning
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Stop spinning and highlight the emotion
      clearInterval(spinInterval);
      setSelectedEmotion(emotionId);
      
      // Determine final wheel position based on emotion
      const emotionPositions: Record<string, number> = {
        happy: 180,
        sad: 0,
        angry: 270,
        fearful: 90,
        surprised: 135,
        // Add more emotion mappings as needed
      };
      
      // Set the wheel to the emotion position or a random position if not mapped
      setWheelRotation(emotionPositions[emotionId] || Math.random() * 360);
      
      // Generate TTS with the emotion
      const ttsResponse = await fetch('https://tts-twitter-agent-547962548252.us-central1.run.app/llasa-voice-synthesizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          audio_url: ''
        })
      });
      
      const ttsData = await ttsResponse.json();
      setSpeechUrl(ttsData.url);
      
    } catch (error) {
      console.error('Error processing request:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const playAudio = () => {
    if (audioRef.current && speechUrl) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };
  
  useEffect(() => {
    if (speechUrl && audioRef.current) {
      playAudio();
    }
  }, [speechUrl]);
  
  return (
    <main className="app-container">
      <h1 className="app-title">Emotional Speech Generator</h1>
      
      <div className="wheel-container">
        <div 
          className="emotion-wheel" 
          style={{ transform: `rotate(${wheelRotation}deg)` }}
        >
          <img src={emotionWheel} alt="Wheel of Emotions" />
          {selectedEmotion && (
            <div className="emotion-highlight">{selectedEmotion}</div>
          )}
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text to be spoken with emotion..."
          disabled={isProcessing}
          className="text-input"
        />
        <button 
          type="submit" 
          disabled={isProcessing || !inputText.trim()} 
          className="submit-button"
        >
          {isProcessing ? 'Processing...' : 'Generate Speech'}
        </button>
      </form>
      
      {speechUrl && (
        <div className="audio-player">
          <audio 
            ref={audioRef} 
            src={speechUrl} 
            controls 
            onEnded={() => setIsPlaying(false)}
          />
          <button 
            onClick={playAudio} 
            disabled={isPlaying} 
            className="play-button"
          >
            {isPlaying ? 'Playing...' : 'Play Again'}
          </button>
        </div>
      )}
      
      {selectedEmotion && (
        <div className="result-container">
          <h2>Selected Emotion: <span className="emotion-tag">{selectedEmotion}</span></h2>
        </div>
      )}
    </main>
  )
}
