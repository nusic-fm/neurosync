import { useState, useEffect, useRef } from "react";
import "./App.css";
import { checkEmotionApiHealth, testEmotionApi } from "./utils";
import EmotionWheel from "./components/EmotionWheel";

// Flag to indicate we're using mock APIs - set to false to attempt real API connection
const USE_MOCK_API = false;

interface EmotionResponse {
  id: string;
  summary: string;
}

export default function App() {
  const [inputText, setInputText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [wheelRotation, setWheelRotation] = useState<number>(0);
  const [speechUrl, setSpeechUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [processingStage, setProcessingStage] = useState<string>("");
  const [apiStatus, setApiStatus] = useState<"unknown" | "online" | "offline">(
    "unknown",
  );
  const [lastApiTest, setLastApiTest] = useState<{
    time: Date | null;
    result: any;
  }>({ time: null, result: null });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [emotionRes, setEmotionRes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputText.trim()) return;

    try {
      // Reset previous state
      setIsProcessing(true);
      setSelectedEmotion(null);
      setSpeechUrl(null);
      setErrorMessage("");
      setStatusMessage("Processing your request...");
      setProcessingStage("initializing");

      // Start the wheel spinning animation
      const spinInterval = setInterval(() => {
        setWheelRotation((prev) => (prev + 5) % 360);
      }, 50);

      // Extract emotions from text
      setProcessingStage("emotion");
      setStatusMessage("Checking API availability...");

      // Skip health checks and directly call the APIs
      setStatusMessage("Analyzing text emotions...");
      console.log("Calling emotion API...");

      try {
        // Emotion Analysis API Call
        setProcessingStage("emotion");
        setStatusMessage("Analyzing text emotions...");
        console.log("Calling emotion API...");

        let emotionId = "free";

        // Skip health check and directly call the API
        console.log("Skipping health check, making direct API call");

        try {
          console.log(
            "Sending to emotion API:",
            JSON.stringify({ query: inputText }),
          );
          console.log(
            "Emotion API endpoint: https://emorag-arangodb-py-547962548252.us-central1.run.app/qa",
          );

          // Use CORS proxy to avoid CORS issues
          // const proxyUrl = 'https://corsproxy.io/?';
          const targetUrl =
            "https://emorag-arangodb-py-547962548252.us-central1.run.app/qa";

          console.log("Using CORS proxy to connect to emotion API");

          // Simplified robust request with better error logging
          const emotionResponse = await fetch(targetUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query: inputText }),
          }).catch((error) => {
            console.error("Fetch error details:", error);
            throw new Error(
              "Network error connecting to emotion API. Server may be offline.",
            );
          });

          console.log("API response status:", emotionResponse.status);

          if (!emotionResponse.ok) {
            const errorText = await emotionResponse
              .text()
              .catch(() => "No error details available");
            console.error(
              "Emotion API Error Response:",
              emotionResponse.status,
              errorText,
            );
            throw new Error(
              `Emotion API returned status ${emotionResponse.status}: ${errorText}`,
            );
          }

          // Try to get the response as JSON first
          let emotionData = await emotionResponse.text();
          setEmotionRes(emotionData);
          // Based on the format you provided:
          // const id = res.data.splite(":")[1].trim().toLowerCase()
          // Example: Summary: abaondoned

          let parsedEmotion = "free";

          // Check if response is an object with data property

          if (emotionData) {
            console.log("Using object data format");
            const dataStr = emotionData.toString();
            // Handle the typo in "splite" - use split instead
            if (dataStr.includes(":")) {
              parsedEmotion =
                dataStr.split(":")[1]?.trim().toLowerCase() || "neutral";
              if (parsedEmotion.includes(",")) {
                parsedEmotion = parsedEmotion.split(",")[0].trim();
              }
            } else if (!dataStr.includes(" ")) {
              parsedEmotion = dataStr.trim().toLowerCase();
            }
          }

          console.log("Parsed emotion:", parsedEmotion);

          // Make sure we have a valid emotion ID by removing any extra spaces or unexpected characters
          emotionId = parsedEmotion;

          // If emotion ended up empty, use neutral
          if (!emotionId) {
            emotionId = "free";
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

        // Just provide the emotion directly to the visualization component
        // We don't need to calculate wheel position anymore since our new
        // visualization handles positioning automatically
        setWheelRotation(0); // Reset rotation as it's not used in the same way anymore

        // Check if TTS API is available before attempting to generate speech
        try {
          // Generate TTS with the emotion
          setProcessingStage("speech");
          setStatusMessage("Generating emotional speech...");
          console.log("Calling TTS API (mock)...");

          try {
            const emotionUrl = `https://storage.googleapis.com/ava_emotions/source/${emotionId}.wav`;
            console.log({ emotionUrl });
            // Use mock speech synthesis
            const speechRes = await fetch(
              "https://tts-twitter-agent-547962548252.us-central1.run.app/llasa-voice-synthesizer",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  text: inputText,
                  audio_url: emotionUrl,
                }),
              },
            ).catch((error) => {
              console.error("Fetch error details:", error);
              throw new Error(
                "Network error connecting to emotion API. Server may be offline.",
              );
            });
            if (speechRes) {
              const speechData = await speechRes.json();
              setSpeechUrl(speechData.url);
              console.log("Speech URL successfully set to:", speechUrl);
              setStatusMessage("Speech generated successfully!");
            } else {
              throw new Error("No URL returned from TTS API");
            }
          } catch (ttsApiError: any) {
            console.error("TTS API Error:", ttsApiError);
            setStatusMessage(
              `Speech generation completed with emotion: ${emotionId}. Speech generation failed: (${ttsApiError.message})`,
            );
            // Don't throw the error - we can still show the emotion even if TTS fails
          }
        } catch (ttsCheckError) {
          console.error("TTS API check failed:", ttsCheckError);
          setStatusMessage(
            `Emotion detected: ${emotionId}. TTS API is currently unavailable.`,
          );
        }
      } catch (apiError: any) {
        clearInterval(spinInterval);
        throw apiError;
      }
    } catch (error: any) {
      console.error("Error processing request:", error);

      // Determine a more user-friendly error message based on the error type
      let userErrorMessage = "Something went wrong";

      if (error instanceof TypeError && error.message.includes("fetch")) {
        userErrorMessage =
          "Network error: Could not connect to the API server. Please check your internet connection and try again.";
      } else if (error.name === "AbortError") {
        userErrorMessage =
          "Request timeout: The API server took too long to respond. Please try again later.";
      } else if (error.message) {
        userErrorMessage = error.message;
      }

      setErrorMessage(`Error: ${userErrorMessage}`);
      setStatusMessage("Failed to process request");

      // Reset emotion display when APIs fail
      setSelectedEmotion(null);
      // Stop the wheel at a neutral position
      setWheelRotation(0);
    } finally {
      setIsProcessing(false);
      setProcessingStage("complete");
    }
  };

  const playAudio = () => {
    if (audioRef.current && speechUrl) {
      setStatusMessage("Playing audio...");

      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
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

  // Generate particles on component mount
  useEffect(() => {
    const particlesContainer = document.querySelector(".particles");
    if (particlesContainer) {
      // Clear existing particles
      particlesContainer.innerHTML = "";

      // Create particles
      for (let i = 0; i < 30; i++) {
        const particle = document.createElement("div");
        particle.classList.add("particle");

        // Random positioning
        const posX = Math.random() * 100;
        const delay = Math.random() * 15;
        const size = 1 + Math.random() * 2;

        particle.style.left = `${posX}%`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        particlesContainer.appendChild(particle);
      }
    }
  }, []);

  return (
    <main className="app-container">
      {/* Particle system */}
      <div className="particles"></div>

      {/* Enhanced scanline effect */}
      <div className="scanline"></div>

      <h1 className="app-title">
        NEURO<span>SYNC</span> 3.0
      </h1>
      <h2
        style={{
          fontSize: "0.9rem",
          textTransform: "uppercase",
          letterSpacing: "2px",
          marginTop: "-0.5rem",
          marginBottom: "1.5rem",
          opacity: 0.8,
          textAlign: "center",
          fontFamily: "'Space Mono', monospace",
        }}
      >
        Advanced Emotion Recognition System
      </h2>

      <div className="api-status">
        <div className={`indicator ${apiStatus}`}></div>
        <span>
          {USE_MOCK_API ? "[SIMULATION ACTIVE] " : "[LIVE CONNECTION] "}
          EMOTION ENGINE:{" "}
          {apiStatus === "online"
            ? USE_MOCK_API
              ? "VIRTUAL MODE"
              : "ONLINE"
            : apiStatus === "offline"
              ? "OFFLINE"
              : "INITIALIZING..."}
        </span>
      </div>

      <EmotionWheel
        selectedEmotion={selectedEmotion}
        wheelRotation={wheelRotation}
        isProcessing={isProcessing}
        processingStage={processingStage}
      />

      {/* {isProcessing && (
        <div className="processing-status">
          <div className="processing-pulse"></div>
          <span>
            Processing:{" "}
            {processingStage === "emotion"
              ? "Analyzing Emotions"
              : processingStage === "speech"
                ? "Generating Speech"
                : processingStage === "initializing"
                  ? "Initializing"
                  : "Processing"}
          </span>
        </div>
      )} */}

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
          <span
            className="test-query"
            onClick={() => setInputText("How does something like this happen")}
          >
            "How does something like this happen"
          </span>
          <span
            className="test-query"
            onClick={() => setInputText("I feel so happy today")}
          >
            "I feel so happy today"
          </span>
          <span
            className="test-query"
            onClick={() => setInputText("I am very sad and lonely")}
          >
            "I am very sad and lonely"
          </span>
        </div>
        <div className="button-group">
          <button
            type="submit"
            disabled={isProcessing || !inputText.trim()}
            className="submit-button"
          >
            {isProcessing
              ? `Processing (${processingStage})...`
              : "Generate Speech"}
          </button>
          <button
            type="button"
            className="api-status-button"
            onClick={() => {
              window.open(
                `https://aeneid.storyscan.xyz/token/0xC5016faea1E7E99Cf977DD0f65991a2Aa9D35cBB`,
                "_blank",
              );
            }}
          >
            View VoicePrint Assets
          </button>
          <button
            type="button"
            disabled={isProcessing || !inputText.trim()}
            className="test-button"
            onClick={async () => {
              try {
                setIsProcessing(true);
                setStatusMessage("Testing emotion API...");
                setErrorMessage("");

                console.log("Testing emotion API with:", inputText);

                // Use mock API directly since the real API is not responding
                import("./mockApi")
                  .then(async ({ mockEmotionAnalysis }) => {
                    try {
                      // Get emotion from mock analysis
                      const emotion = mockEmotionAnalysis(inputText);
                      console.log("Mock emotion analysis result:", emotion);

                      setApiStatus("online");
                      setSelectedEmotion(emotion);
                      setStatusMessage(
                        `Emotion API test successful! Emotion: ${emotion}`,
                      );

                      // More comprehensive mapping of emotions to wheel positions
                      const emotionPositions: Record<string, number> = {
                        // Primary emotions
                        joy: 0,
                        love: 60,
                        anger: 120,
                        sadness: 180,
                        fear: 240,
                        surprise: 300,

                        // Secondary emotions - joy family
                        happy: 0,
                        happiness: 0,
                        serenity: 0,
                        ecstasy: 0,
                        cheerful: 0,

                        // Secondary emotions - love family
                        affection: 60,
                        romance: 60,
                        compassion: 60,

                        // Secondary emotions - anger family
                        angry: 120,
                        annoyance: 120,
                        rage: 120,
                        disgust: 120,
                        disgusted: 120,

                        // Secondary emotions - sadness family
                        sad: 180,
                        disappointment: 180,
                        grief: 180,
                        loneliness: 180,
                        depressed: 180,

                        // Secondary emotions - fear family
                        fearful: 240,
                        anxiety: 240,
                        terror: 240,
                        insecurity: 240,
                        worried: 240,

                        // Secondary emotions - surprise family
                        surprised: 300,
                        amazement: 300,
                        shock: 300,
                        distraction: 300,
                        astonished: 300,

                        // Neutral
                        neutral: 225,
                      };

                      setWheelRotation(emotionPositions[emotion] || 225);
                    } catch (error: any) {
                      console.error("Mock emotion analysis error:", error);
                      setErrorMessage(
                        `Emotion API Test Error: ${error.message}`,
                      );
                      setStatusMessage("Emotion API test failed");
                      setSelectedEmotion(null);
                      setWheelRotation(0);
                    } finally {
                      setIsProcessing(false);
                    }
                  })
                  .catch((importError) => {
                    console.error("Error importing mock API:", importError);
                    setErrorMessage(
                      `Failed to import mock API: ${importError.message}`,
                    );
                    setStatusMessage("Emotion API test failed");
                    setIsProcessing(false);
                  });
              } catch (error: any) {
                console.error("Emotion API Test Error:", error);
                setErrorMessage(`Emotion API Test Error: ${error.message}`);
                setStatusMessage("Emotion API test failed");
                setSelectedEmotion(null);
                setWheelRotation(0);
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
            <div
              className={`status-indicator ${isProcessing ? "active" : ""}`}
            ></div>
            {statusMessage}
          </div>
        )}

        {errorMessage && (
          <div className="error-message">
            <div>{errorMessage}</div>
            <button onClick={() => handleSubmit(new Event("submit") as any)}>
              Retry
            </button>
          </div>
        )}
      </form>

      {speechUrl && (
        <div className="audio-player">
          <div className="audio-status">
            Audio generated successfully!
            <span
              className={`audio-indicator ${isPlaying ? "playing" : ""}`}
            ></span>
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
            {isPlaying ? "Playing..." : "Play Again"}
          </button>
          <div className="audio-url">
            <a href={speechUrl} target="_blank" rel="noopener noreferrer">
              Audio URL (opens in new tab)
            </a>
          </div>
        </div>
      )}

      {emotionRes && (
        <div className="result-container">
          <h2>
            EmoRAG Response: <span className="emotion-tag">{emotionRes}</span>
          </h2>
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
                  setStatusMessage("Running manual API test...");
                  setErrorMessage("");

                  console.log("MANUAL API TEST START -----");

                  // Try a direct fetch with detailed logging
                  const testPayload = {
                    query: "How does something like this happen",
                  };

                  console.log("Test payload:", JSON.stringify(testPayload));
                  console.log("Sending manual test to API...");

                  // Use CORS proxy for manual API test
                  const proxyUrl = "https://corsproxy.io/?";
                  const targetUrl =
                    "https://emorag-arangodb-py-547962548252.us-central1.run.app/extract-emotions/qa";

                  console.log("Using CORS proxy for manual API test");

                  const testResponse = await fetch(
                    proxyUrl + encodeURIComponent(targetUrl),
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json, text/plain, */*",
                        Origin: window.location.origin,
                      },
                      body: JSON.stringify(testPayload),
                      mode: "cors",
                      cache: "no-cache",
                      credentials: "omit",
                      redirect: "follow",
                      signal: AbortSignal.timeout(20000),
                    },
                  ).catch((e) => {
                    console.error("Manual test fetch error:", e);
                    throw e;
                  });

                  console.log(
                    "Manual test response status:",
                    testResponse.status,
                  );
                  console.log(
                    "Manual test response headers:",
                    Object.fromEntries([...testResponse.headers]),
                  );

                  if (testResponse.ok) {
                    let responseContent;
                    try {
                      responseContent = await testResponse.json();
                      console.log(
                        "Manual test response (JSON):",
                        responseContent,
                      );
                    } catch (jsonError) {
                      responseContent = await testResponse.text();
                      console.log(
                        "Manual test response (Text):",
                        responseContent,
                      );
                    }

                    setStatusMessage(
                      `Manual API test successful! Response received.`,
                    );
                    console.log("MANUAL API TEST END -----");
                  } else {
                    const errorText = await testResponse
                      .text()
                      .catch(() => "No error text available");
                    console.error("Manual test error response:", errorText);
                    throw new Error(
                      `API returned status ${testResponse.status}: ${errorText}`,
                    );
                  }
                } catch (error: any) {
                  console.error("Manual API test failed:", error);
                  setErrorMessage(`Manual API test failed: ${error.message}`);
                  setStatusMessage(
                    "Manual API test failed. See console for details.",
                  );
                  console.log("MANUAL API TEST END (WITH ERROR) -----");
                }
              }}
            >
              Run Manual API Test
            </button>
            <p className="debug-note">
              Note: Open your browser's developer console (F12 or right-click
              and select "Inspect") to see detailed logs from the API tests.
            </p>
            <h3>API Connection Status</h3>
            <p>
              API endpoint:{" "}
              <code>
                https://emorag-arangodb-py-547962548252.us-central1.run.app/extract-emotions/qa
              </code>
            </p>
            <p>
              Current status:{" "}
              <span className={`api-status-indicator ${apiStatus}`}>
                {apiStatus}
              </span>
            </p>
          </div>
        </details>
      </div>
    </main>
  );
}
