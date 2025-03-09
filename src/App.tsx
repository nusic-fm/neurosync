import { useState, useEffect, useRef } from 'react'
import './App.css'
import { checkEmotionApiHealth, testEmotionApi } from './utils'
import EmotionWheel from './components/EmotionWheel'

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
  const [apiStatus, setApiStatus] = useState<'unknown' | 'online' | 'offline'>('unknown');
  const [lastApiTest, setLastApiTest] = useState<{ time: Date | null, result: any }>({ time: null, result: null });
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

      // Skip health checks and directly call the APIs
      setStatusMessage('Analyzing text emotions...');
      console.log("Calling emotion API...");

      try {
        // Emotion Analysis API Call
        setProcessingStage('emotion');
        setStatusMessage('Analyzing text emotions...');
        console.log("Calling emotion API...");

        let emotionId = 'neutral';

        // Skip health check and directly call the API
        console.log("Skipping health check, making direct API call");

        try {
          console.log("Sending to emotion API:", JSON.stringify({ query: inputText }));
          console.log("Emotion API endpoint: https://emorag-arangodb-py-547962548252.us-central1.run.app/extract-emotions/qa");

          // Simplified robust request with better error logging
          const emotionResponse = await fetch('https://emorag-arangodb-py-547962548252.us-central1.run.app/extract-emotions/qa', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json, text/plain, */*'
            },
            body: JSON.stringify({ query: inputText }),
            // Adding timeout to prevent long-hanging requests
            signal: AbortSignal.timeout(30000)
          }).catch(error => {
            console.error("Fetch error details:", error);
            throw new Error("Network error connecting to emotion API. Server may be offline.");
          });

          console.log("API response status:", emotionResponse.status);

          if (!emotionResponse.ok) {
            const errorText = await emotionResponse.text().catch(() => "No error details available");
            console.error("Emotion API Error Response:", emotionResponse.status, errorText);
            throw new Error(`Emotion API returned status ${emotionResponse.status}: ${errorText}`);
          }

          // Try to get the response as JSON first
          let emotionData;
          try {
            emotionData = await emotionResponse.json();
            console.log("Emotion API JSON response:", emotionData);
          } catch (jsonError) {
            // If JSON parsing fails, get as text
            emotionData = await emotionResponse.text();
            console.log("Emotion API text response:", emotionData);
          }

          // Based on the format you provided:
          // const id = res.data.splite(":")[1].trim().toLowerCase()
          // Example: Summary: abaondoned

          let parsedEmotion = 'neutral';

          // Check if response is an object with data property
          if (typeof emotionData === 'object' && emotionData.data) {
            console.log("Using object data format");
            const dataStr = emotionData.data.toString();
            // Handle the typo in "splite" - use split instead
            if (dataStr.includes(':')) {
              parsedEmotion = dataStr.split(':')[1]?.trim().toLowerCase() || 'neutral';
            }
          } 
          // If it's text and contains "Summary:"
          else if (typeof emotionData === 'string' && emotionData.includes('Summary:')) {
            console.log("Using Summary: format");
            parsedEmotion = emotionData.split('Summary:')[1]?.trim().toLowerCase() || 'neutral';
          } 
          // If it's just text with a colon
          else if (typeof emotionData === 'string' && emotionData.includes(':')) {
            console.log("Using basic colon format");
            parsedEmotion = emotionData.split(':')[1]?.trim().toLowerCase() || 'neutral';
          }

          console.log("Parsed emotion:", parsedEmotion);

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

      <div className="api-status">
        <div className={`indicator ${apiStatus}`}></div>
        <span>
          Emotion API: {apiStatus === 'online' ? 'Online' : apiStatus === 'offline' ? 'Offline' : 'Unknown'}
        </span>
      </div>

      <EmotionWheel 
        selectedEmotion={selectedEmotion} 
        wheelRotation={wheelRotation}
        isProcessing={isProcessing} 
      />

      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text to be spoken with emotion..."
          disabled={isProcessing}
          className="text-input"
        />

        <div className="test-options">
          <span>Quick Test Queries: </span>
          <span className="test-query" onClick={() => setInputText("I'm in the town, lets roam around")}>
            "I'm in the town, lets roam around"
          </span>
          <span className="test-query" onClick={() => setInputText("I feel so happy today")}>
            "I feel so happy today"
          </span>
          <span className="test-query" onClick={() => setInputText("I am very sad and lonely")}>
            "I am very sad and lonely"
          </span>
        </div>
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
            className="api-status-button"
            onClick={async () => {
              try {
                setStatusMessage('Checking API connection...');
                setErrorMessage('');

                // First log the full diagnostic info
                console.log("API DIAGNOSTICS START -----");
                console.log("Browser info:", navigator.userAgent);
                console.log("Current time:", new Date().toISOString());

                // Try a direct fetch with detailed logging
                try {
                  console.log("Making direct API test call...");
                  const directResponse = await fetch('https://emorag-arangodb-py-547962548252.us-central1.run.app/extract-emotions/qa', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Accept': 'application/json, text/plain, */*'
                    },
                    body: JSON.stringify({ query: "Test message from UI" }),
                    mode: 'cors',
                    cache: 'no-cache',
                    signal: AbortSignal.timeout(15000)
                  }).catch(e => {
                    console.error("Direct fetch error:", e);
                    throw e;
                  });

                  console.log("Direct API response status:", directResponse.status);
                  console.log("Direct API response headers:", Object.fromEntries([...directResponse.headers]));

                  const responseText = await directResponse.text();
                  console.log("Direct API response text:", responseText);

                  // Now use the utility function
                  const isOnline = await checkEmotionApiHealth();
                  console.log("API DIAGNOSTICS END -----");

                  setApiStatus(isOnline ? 'online' : 'offline');
                  setStatusMessage(isOnline ? 
                    'API connection successful! The emotion API is online.' : 
                    'API connection failed. The emotion API appears to be offline. See console for details.');

                  if (!isOnline) {
                    setErrorMessage('API server appears to be offline. Please check browser console for diagnostic information.');
                  }
                } catch (directError: any) {
                  console.error("Direct API test failed:", directError);
                  throw directError;
                }
              } catch (error: any) {
                console.error("API Connection Error:", error);
                setApiStatus('offline');
                setStatusMessage('API connection check failed');
                setErrorMessage(`API Connection Error: ${error.message}. See console for details.`);
              }
            }}
          >
            Check API Status
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
                // Use our utility function to test the API
                const testResult = await testEmotionApi(inputText);
                setLastApiTest({
                  time: new Date(),
                  result: testResult
                });

                if (!testResult.success) {
                  setApiStatus('offline');
                  throw new Error(testResult.error || "API test failed");
                }

                setApiStatus('online');

                // Parse the emotion from the test result
                let emotion = testResult.parsedEmotion || 'neutral';
                console.log("Test parsed emotion:", emotion);

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

      <div className="debug-section">
        <details>
          <summary>API Diagnostics (Expand for troubleshooting)</summary>
          <div className="debug-tools">
            <h3>Manual API Test</h3>
            <p>Use this to directly test the Emotion API endpoint:</p>
            <button
              className="debug-button"
              onClick={async () => {
                try {
                  setStatusMessage('Running manual API test...');
                  setErrorMessage('');

                  console.log("MANUAL API TEST START -----");

                  // Try a direct fetch with detailed logging
                  const testPayload = { query: "I'm in the town, lets roam around" };

                  console.log("Test payload:", JSON.stringify(testPayload));
                  console.log("Sending manual test to API...");

                  const testResponse = await fetch('https://emorag-arangodb-py-547962548252.us-central1.run.app/extract-emotions/qa', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Accept': 'application/json, text/plain, */*'
                    },
                    body: JSON.stringify(testPayload),
                    mode: 'cors',
                    cache: 'no-cache',
                    credentials: 'omit',
                    redirect: 'follow',
                    signal: AbortSignal.timeout(20000)
                  }).catch(e => {
                    console.error("Manual test fetch error:", e);
                    throw e;
                  });

                  console.log("Manual test response status:", testResponse.status);
                  console.log("Manual test response headers:", Object.fromEntries([...testResponse.headers]));

                  if (testResponse.ok) {
                    let responseContent;
                    try {
                      responseContent = await testResponse.json();
                      console.log("Manual test response (JSON):", responseContent);
                    } catch (jsonError) {
                      responseContent = await testResponse.text();
                      console.log("Manual test response (Text):", responseContent);
                    }

                    setStatusMessage(`Manual API test successful! Response received.`);
                    console.log("MANUAL API TEST END -----");
                  } else {
                    const errorText = await testResponse.text().catch(() => "No error text available");
                    console.error("Manual test error response:", errorText);
                    throw new Error(`API returned status ${testResponse.status}: ${errorText}`);
                  }
                } catch (error: any) {
                  console.error("Manual API test failed:", error);
                  setErrorMessage(`Manual API test failed: ${error.message}`);
                  setStatusMessage('Manual API test failed. See console for details.');
                  console.log("MANUAL API TEST END (WITH ERROR) -----");
                }
              }}
            >
              Run Manual API Test
            </button>
            <p className="debug-note">
              Note: Open your browser's developer console (F12 or right-click and select "Inspect") to see detailed logs from the API tests.
            </p>
            <h3>API Connection Status</h3>
            <p>API endpoint: <code>https://emorag-arangodb-py-547962548252.us-central1.run.app/extract-emotions/qa</code></p>
            <p>Current status: <span className={`api-status-indicator ${apiStatus}`}>{apiStatus}</span></p>
          </div>
        </details>
      </div>
    </main>
  )
}