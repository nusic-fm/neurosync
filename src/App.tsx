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
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [processingStage, setProcessingStage] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputText.trim()) return;

    try {
      // Reset previous state
      setIsProcessing(true);
      setSelectedEmotion(null);
      setSpeechUrl(null);
      setErrorMessage('');
      setStatusMessage('Processing your request...');
      setProcessingStage('initializing');

      // Start the wheel spinning animation
      const spinInterval = setInterval(() => {
        setWheelRotation(prev => (prev + 5) % 360);
      }, 50);

      // Extract emotions from text
      setProcessingStage('emotion');
      setStatusMessage('Analyzing text emotions...');
      console.log("Calling emotion API...");

      try {
        // Emotion Analysis API Call
        setProcessingStage('emotion');
        setStatusMessage('Analyzing text emotions...');
        console.log("Calling emotion API...");

        let emotionId = 'neutral';

        try {
          const emotionResponse = await fetch('https://emorag-arangodb-py-547962548252.us-central1.run.app/extract-emotions/qa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: inputText }),
            // Adding timeout to prevent long-hanging requests
            signal: AbortSignal.timeout(10000)
          });

          if (!emotionResponse.ok) {
            throw new Error(`Emotion API returned status ${emotionResponse.status}: ${emotionResponse.statusText}`);
          }

          const emotionData = await emotionResponse.text();
          console.log("Emotion API response:", emotionData);
          setStatusMessage(`Detected emotion: ${emotionData}`);

          emotionId = emotionData.split(':')[1]?.trim().toLowerCase() || 'neutral';
          console.log("Extracted emotion ID:", emotionId);
        } catch (emotionApiError: any) {
          console.error("Emotion API Error:", emotionApiError);
          setStatusMessage(`Emotion API failed. Using default emotion: neutral. (${emotionApiError.message})`);
          // Continue with default emotion even if emotion API fails
        }

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
          disgusted: 315,
          neutral: 225,
          // Add more emotion mappings as needed
        };

        // Set the wheel to the emotion position or a random position if not mapped
        setWheelRotation(emotionPositions[emotionId] || Math.random() * 360);

        // Generate TTS with the emotion
        setProcessingStage('speech');
        setStatusMessage('Generating emotional speech...');
        console.log("Calling TTS API...");

        try {
          const ttsResponse = await fetch('https://tts-twitter-agent-547962548252.us-central1.run.app/llasa-voice-synthesizer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: inputText,
              audio_url: ''
            }),
            // Adding timeout to prevent long-hanging requests
            signal: AbortSignal.timeout(20000)
          });

          if (!ttsResponse.ok) {
            throw new Error(`TTS API returned status ${ttsResponse.status}: ${ttsResponse.statusText}`);
          }

          const ttsData = await ttsResponse.json();
          console.log("TTS API response:", ttsData);

          if (ttsData.url) {
            setSpeechUrl(ttsData.url);
            setStatusMessage('Speech generated successfully!');
            console.log("Speech URL set to:", ttsData.url);
          } else {
            throw new Error("No URL returned from TTS API");
          }
        } catch (ttsApiError: any) {
          console.error("TTS API Error:", ttsApiError);
          setStatusMessage(`Speech generation failed. (${ttsApiError.message})`);
          throw ttsApiError;
        }
      } catch (apiError: any) {
        clearInterval(spinInterval);
        throw apiError;
      }

    } catch (error: any) {
      console.error('Error processing request:', error);

      // Determine a more user-friendly error message based on the error type
      let userErrorMessage = 'Something went wrong';

      if (error instanceof TypeError && error.message.includes('fetch')) {
        userErrorMessage = 'Network error: Could not connect to the API server. Please check your internet connection and try again.';
      } else if (error.name === 'AbortError') {
        userErrorMessage = 'Request timeout: The API server took too long to respond. Please try again later.';
      } else if (error.message) {
        userErrorMessage = error.message;
      }

      setErrorMessage(`Error: ${userErrorMessage}`);
      setStatusMessage('Failed to process request');

      // Show a mock emotion if the API calls fail to demonstrate the UI
      if (!selectedEmotion) {
        const mockEmotions = ['happy', 'sad', 'angry', 'surprised'];
        const randomEmotion = mockEmotions[Math.floor(Math.random() * mockEmotions.length)];
        setSelectedEmotion(randomEmotion);

        // Mock wheel position for the random emotion
        const emotionPositions: Record<string, number> = {
          happy: 180,
          sad: 0,
          angry: 270,
          surprised: 135,
        };
        setWheelRotation(emotionPositions[randomEmotion]);
      }
    } finally {
      setIsProcessing(false);
      setProcessingStage('complete');
    }
  };

  const playAudio = () => {
    if (audioRef.current && speechUrl) {
      setStatusMessage('Playing audio...');

      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(error => {
            console.error("Audio playback error:", error);
            setErrorMessage(`Audio playback failed: ${error.message}`);
            setIsPlaying(false);
          });
      }
    }
  };

  useEffect(() => {
    if (speechUrl && audioRef.current) {
      audioRef.current.src = speechUrl;
      audioRef.current.load();
      playAudio();
    }
  }, [speechUrl]);

  return (
    <main className="app-container">
      <h1 className="app-title">Emotional Speech Generator</h1>

      <div className="wheel-container">
        <div className="wheel-pointer"></div>
        <div 
          className="emotion-wheel" 
          style={{ transform: `rotate(${wheelRotation}deg)` }}
        >
          <img src={emotionWheel} alt="Wheel of Emotions" />
        </div>
        {selectedEmotion && (
          <div className="emotion-highlight">{selectedEmotion}</div>
        )}
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
          {isProcessing ? `Processing (${processingStage})...` : 'Generate Speech'}
        </button>

        {statusMessage && (
          <div className="status-message">
            <div className={`status-indicator ${isProcessing ? 'active' : ''}`}></div>
            {statusMessage}
          </div>
        )}

        {errorMessage && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}
      </form>

      {speechUrl && (
        <div className="audio-player">
          <div className="audio-status">
            Audio generated successfully!
            <span className={`audio-indicator ${isPlaying ? 'playing' : ''}`}></span>
          </div>
          <audio 
            ref={audioRef} 
            src={speechUrl} 
            controls 
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={(e) => {
              console.error("Audio playback error:", e);
              setErrorMessage("Failed to play audio. Please try again.");
            }}
          />
          <button 
            onClick={playAudio} 
            disabled={isPlaying} 
            className="play-button"
          >
            {isPlaying ? 'Playing...' : 'Play Again'}
          </button>
          <div className="audio-url">
            <a href={speechUrl} target="_blank" rel="noopener noreferrer">
              Audio URL (opens in new tab)
            </a>
          </div>
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