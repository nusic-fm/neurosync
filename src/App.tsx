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
      setStatusMessage('Checking API availability...');

      // Check both APIs to ensure they're accessible
      try {
        // Define the health check function
        const checkApiHealth = async (url: string, name: string) => {
          try {
            const response = await fetch(`${url}/health`, {
              method: 'GET',
              signal: AbortSignal.timeout(5000),
              mode: 'cors',
              cache: 'no-cache'
            }).catch(() => null);

            if (!response) {
              throw new Error(`${name} API appears to be offline`);
            }
            return true;
          } catch (error) {
            console.error(`${name} API health check failed:`, error);
            return false;
          }
        };

        // Check emotion API
        const emotionApiAlive = await checkApiHealth(
          'https://emorag-arangodb-py-547962548252.us-central1.run.app', 
          'Emotion'
        );

        // Check TTS API
        const ttsApiAlive = await checkApiHealth(
          'https://tts-twitter-agent-547962548252.us-central1.run.app', 
          'TTS'
        );

        if (!emotionApiAlive && !ttsApiAlive) {
          throw new Error('Both API servers appear to be offline. Please try again later.');
        } else if (!emotionApiAlive) {
          throw new Error('Emotion API server appears to be offline. Please try again later.');
        } else if (!ttsApiAlive) {
          throw new Error('TTS API server appears to be offline. Please try again later.');
        }

        setStatusMessage('APIs are available. Processing your request...');
      } catch (apiCheckError: any) {
        clearInterval(spinInterval);
        throw apiCheckError;
      }

      setStatusMessage('Analyzing text emotions...');
      console.log("Calling emotion API...");

      try {
        // Emotion Analysis API Call
        setProcessingStage('emotion');
        setStatusMessage('Analyzing text emotions...');
        console.log("Calling emotion API...");

        let emotionId = 'neutral';

        try {
          console.log("Sending to emotion API:", JSON.stringify({ query: inputText }));
          
          const emotionResponse = await fetch('https://emorag-arangodb-py-547962548252.us-central1.run.app/extract-emotions/qa', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'text/plain'
            },
            body: JSON.stringify({ query: inputText }),
            // Adding timeout to prevent long-hanging requests
            signal: AbortSignal.timeout(30000),
            // Add mode for CORS
            mode: 'cors',
            // Add cache control
            cache: 'no-cache'
          });

          if (!emotionResponse.ok) {
            throw new Error(`Emotion API returned status ${emotionResponse.status}: ${emotionResponse.statusText}`);
          }

          const emotionData = await emotionResponse.text();
          console.log("Emotion API raw response:", emotionData);

          // Extract emotion from the response based on the provided example format
          let parsedEmotion = '';
          
          if (emotionData.includes('Summary:')) {
            // Format: "Summary: abandoned"
            parsedEmotion = emotionData.split('Summary:')[1]?.trim().toLowerCase() || 'neutral';
            console.log("Parsed emotion from 'Summary:' format:", parsedEmotion);
          } else if (emotionData.includes(':')) {
            // Format: "response: abandoned"
            parsedEmotion = emotionData.split(':')[1]?.trim().toLowerCase() || 'neutral';
            console.log("Parsed emotion from ':' format:", parsedEmotion);
          } else {
            // If no clear format, just use the cleaned text
            parsedEmotion = emotionData.trim().toLowerCase() || 'neutral';
            console.log("Using raw response as emotion:", parsedEmotion);
          }

          // Make sure we have a valid emotion ID by removing any extra spaces or unexpected characters
          emotionId = parsedEmotion.replace(/[^a-z]/g, '');
          
          // If emotion ended up empty, use neutral
          if (!emotionId) {
            emotionId = 'neutral';
          }
          
          console.log("Final extracted emotion ID:", emotionId);
          console.log("Extracted emotion ID:", emotionId);
          setStatusMessage(`Detected emotion: ${emotionId}`);

          // Only set the emotion if we actually got a response
          setSelectedEmotion(emotionId);
        } catch (emotionApiError: any) {
          console.error("Emotion API Error:", emotionApiError);
          setStatusMessage(`Emotion API failed. (${emotionApiError.message})`);
          // Don't continue with a default emotion - throw the error up
          throw emotionApiError;
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

        // Check if TTS API is available before attempting to generate speech
          try {
            const ttsApiCheck = await fetch('https://tts-twitter-agent-547962548252.us-central1.run.app/health', {
              method: 'GET',
              signal: AbortSignal.timeout(5000),
              mode: 'cors',
              cache: 'no-cache'
            }).catch(() => null);

            if (ttsApiCheck) {
              // Generate TTS with the emotion
              setProcessingStage('speech');
              setStatusMessage('Generating emotional speech...');
              console.log("Calling TTS API...");

              try {
                const ttsResponse = await fetch('https://tts-twitter-agent-547962548252.us-central1.run.app/llasa-voice-synthesizer', {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                  },
                  body: JSON.stringify({
                    text: inputText,
                    audio_url: ''
                  }),
                  // Extend timeout for TTS as it might take longer
                  signal: AbortSignal.timeout(30000),
                  // Add mode for CORS
                  mode: 'cors',
                  // Add cache control
                  cache: 'no-cache'
                });

                if (!ttsResponse.ok) {
                  throw new Error(`TTS API returned status ${ttsResponse.status}: ${ttsResponse.statusText}`);
                }

                // First try to parse as JSON
                let ttsData;
                try {
                  ttsData = await ttsResponse.json();
                  console.log("TTS API response (JSON):", ttsData);
                } catch (parseError) {
                  // If JSON parsing fails, try as text
                  const textResponse = await ttsResponse.text();
                  console.log("TTS API response (Text):", textResponse);

                  // Try to extract URL from text if it's not JSON
                  if (textResponse.includes('http')) {
                    ttsData = { url: textResponse.trim() };
                  } else {
                    throw new Error("Unable to parse TTS API response");
                  }
                }

                if (ttsData && ttsData.url) {
                  setSpeechUrl(ttsData.url);
                  console.log("Speech URL successfully set to:", ttsData.url);
                  setStatusMessage('Speech generated successfully!');
                  console.log("Speech URL set to:", ttsData.url);
                } else {
                  throw new Error("No URL returned from TTS API");
                }
              } catch (ttsApiError: any) {
                console.error("TTS API Error:", ttsApiError);
                setStatusMessage(`Speech generation completed with emotion: ${emotionId}. Speech generation failed: (${ttsApiError.message})`);
                // Don't throw the error - we can still show the emotion even if TTS fails
              }
            } else {
              // TTS API is unavailable, but we still have the emotion result
              setStatusMessage(`Emotion detected: ${emotionId}. TTS API is currently unavailable.`);
            }
          } catch (ttsCheckError) {
            console.error("TTS API check failed:", ttsCheckError);
            setStatusMessage(`Emotion detected: ${emotionId}. TTS API is currently unavailable.`);
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

      // Reset emotion display when APIs fail
      setSelectedEmotion(null);
      // Stop the wheel at a neutral position
      setWheelRotation(0);
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
        <div className="button-group">
          <button 
            type="submit" 
            disabled={isProcessing || !inputText.trim()} 
            className="submit-button"
          >
            {isProcessing ? `Processing (${processingStage})...` : 'Generate Speech'}
          </button>
          <button 
            type="button" 
            disabled={isProcessing || !inputText.trim()} 
            className="test-button"
            onClick={async () => {
              try {
                setIsProcessing(true);
                setStatusMessage('Testing emotion API...');
                setErrorMessage('');
                
                console.log("Testing emotion API with:", inputText);
                
                // First check if the API is available
                try {
                  const healthCheck = await fetch('https://emorag-arangodb-py-547962548252.us-central1.run.app/health', {
                    method: 'GET',
                    signal: AbortSignal.timeout(5000),
                    mode: 'cors',
                    cache: 'no-cache'
                  });
                  
                  if (!healthCheck.ok) {
                    throw new Error(`API health check failed with status ${healthCheck.status}`);
                  }
                  
                  console.log("API health check successful, proceeding with test");
                } catch (healthError: any) {
                  console.error("API health check failed:", healthError);
                  throw new Error("API server appears to be offline. Please try again later.");
                }
                
                // Now make the actual API call
                try {
                  const emotionResponse = await fetch('https://emorag-arangodb-py-547962548252.us-central1.run.app/extract-emotions/qa', {
                    method: 'POST',
                    headers: { 
                      'Content-Type': 'application/json',
                      'Accept': 'text/plain'
                    },
                    body: JSON.stringify({ query: inputText }),
                    signal: AbortSignal.timeout(30000),
                    mode: 'cors',
                    cache: 'no-cache',
                    credentials: 'omit'
                  });
                  
                  if (!emotionResponse.ok) {
                    const errorText = await emotionResponse.text().catch(() => "No error details available");
                    console.error("API Error Response:", emotionResponse.status, errorText);
                    throw new Error(`API returned status ${emotionResponse.status}: ${errorText}`);
                  }
                  
                  const responseText = await emotionResponse.text();
                  console.log("API Response:", responseText);
                  
                  let emotion = 'neutral';
                  if (responseText.includes('Summary:')) {
                    emotion = responseText.split('Summary:')[1]?.trim().toLowerCase() || 'neutral';
                  } else if (responseText.includes(':')) {
                    emotion = responseText.split(':')[1]?.trim().toLowerCase() || 'neutral';
                  } else {
                    emotion = responseText.trim().toLowerCase() || 'neutral';
                  }
                  
                  // Clean up the emotion string (remove any non-alphanumeric characters)
                  emotion = emotion.replace(/[^a-z]/g, '');
                  if (!emotion) emotion = 'neutral';
                  
                  setSelectedEmotion(emotion);
                  setStatusMessage(`Emotion API test successful! Emotion: ${emotion}`);
                  
                  // Set wheel position
                  const emotionPositions: Record<string, number> = {
                    happy: 180,
                    sad: 0,
                    angry: 270,
                    fearful: 90,
                    surprised: 135,
                    disgusted: 315,
                    neutral: 225,
                  };
                  setWheelRotation(emotionPositions[emotion] || Math.random() * 360);
                } catch (apiCallError: any) {
                  console.error("API Call Error:", apiCallError);
                  throw apiCallError;
                }
                
              } catch (error: any) {
                console.error("Emotion API Test Error:", error);
                setErrorMessage(`Emotion API Test Error: ${error.message}`);
                setStatusMessage('Emotion API test failed');
                
                // Reset the wheel and emotion when there's an error
                setSelectedEmotion(null);
                setWheelRotation(0);
              } finally {
                setIsProcessing(false);
              }
            }}
          >
            Test Emotion API Only
          </button>
        </div>

        {statusMessage && (
          <div className="status-message">
            {isProcessing && <div className="testing-indicator"></div>}
            <div className={`status-indicator ${isProcessing ? 'active' : ''}`}></div>
            {statusMessage}
          </div>
        )}

        {errorMessage && (
          <div className="error-message">
            <div>{errorMessage}</div>
            <button onClick={() => handleSubmit(new Event('submit') as any)}>
              Retry
            </button>
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