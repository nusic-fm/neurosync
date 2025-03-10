import React, { useState, useEffect } from 'react';
import './EmotionWheel.css';

// Simplified emotion types
interface Tertiary {
  name: string;
  color: string;
}

interface Secondary {
  name: string;
  color: string;
  tertiaryEmotions: Tertiary[];
}

interface Primary {
  name: string;
  color: string;
  angle: number;
  secondaryEmotions: Secondary[];
}

interface EmotionWheelProps {
  selectedEmotion: string | null;
  wheelRotation: number;
  isProcessing: boolean;
  processingStage: string;
}

const emotionWheel: Primary[] = [
  {
    name: "Happy",
    color: "#FFDE59",
    angle: 0,
    secondaryEmotions: [
      {
        name: "Optimistic",
        color: "#FFF59D",
        tertiaryEmotions: [
          { name: "Inspired", color: "#FFFDE7" },
          { name: "Hopeful", color: "#FFF9C4" }
        ]
      },
      {
        name: "Trusting",
        color: "#FFE082",
        tertiaryEmotions: [
          { name: "Sensitive", color: "#FFECB3" },
          { name: "Intimate", color: "#FFD54F" }
        ]
      }
    ]
  },
  {
    name: "Sad",
    color: "#4C6EF5",
    angle: 180,
    secondaryEmotions: [
      {
        name: "Lonely",
        color: "#9FA8DA",
        tertiaryEmotions: [
          { name: "Isolated", color: "#C5CAE9" },
          { name: "Abandoned", color: "#7986CB" }
        ]
      },
      {
        name: "Depressed",
        color: "#7986CB",
        tertiaryEmotions: [
          { name: "Helpless", color: "#5C6BC0" },
          { name: "Hopeless", color: "#3F51B5" }
        ]
      }
    ]
  },
  {
    name: "Angry",
    color: "#E53935",
    angle: 120,
    secondaryEmotions: [
      {
        name: "Mad",
        color: "#EF9A9A",
        tertiaryEmotions: [
          { name: "Furious", color: "#E57373" },
          { name: "Enraged", color: "#EF5350" }
        ]
      },
      {
        name: "Frustrated",
        color: "#F44336",
        tertiaryEmotions: [
          { name: "Annoyed", color: "#EF5350" },
          { name: "Irritated", color: "#E53935" }
        ]
      }
    ]
  },
  {
    name: "Fearful",
    color: "#8E24AA",
    angle: 240,
    secondaryEmotions: [
      {
        name: "Scared",
        color: "#CE93D8",
        tertiaryEmotions: [
          { name: "Terrified", color: "#BA68C8" },
          { name: "Panicked", color: "#AB47BC" }
        ]
      },
      {
        name: "Anxious",
        color: "#AB47BC",
        tertiaryEmotions: [
          { name: "Worried", color: "#9C27B0" },
          { name: "Nervous", color: "#8E24AA" }
        ]
      }
    ]
  },
  {
    name: "Surprised",
    color: "#009688",
    angle: 300,
    secondaryEmotions: [
      {
        name: "Amazed",
        color: "#80CBC4",
        tertiaryEmotions: [
          { name: "Astonished", color: "#4DB6AC" },
          { name: "Awestruck", color: "#26A69A" }
        ]
      },
      {
        name: "Confused",
        color: "#26A69A",
        tertiaryEmotions: [
          { name: "Perplexed", color: "#009688" },
          { name: "Disillusioned", color: "#00897B" }
        ]
      }
    ]
  },
  {
    name: "Peaceful",
    color: "#43A047",
    angle: 60,
    secondaryEmotions: [
      {
        name: "Content",
        color: "#A5D6A7",
        tertiaryEmotions: [
          { name: "Satisfied", color: "#81C784" },
          { name: "Calm", color: "#66BB6A" }
        ]
      },
      {
        name: "Relaxed",
        color: "#66BB6A",
        tertiaryEmotions: [
          { name: "Serene", color: "#4CAF50" },
          { name: "Free", color: "#43A047" }
        ]
      }
    ]
  },
  {
    name: "Disgusted",
    color: "#66BB6A",
    angle: 315,
    secondaryEmotions: [
      {
        name: "Critical",
        color: "#A5D6A7",
        tertiaryEmotions: [
          { name: "Skeptical", color: "#C8E6C9" },
          { name: "Dismissive", color: "#A5D6A7" }
        ]
      },
      {
        name: "Disapproving",
        color: "#81C784",
        tertiaryEmotions: [
          { name: "Judgmental", color: "#66BB6A" },
          { name: "Embarrassed", color: "#4CAF50" }
        ]
      }
    ]
  },
    {
    name: "Surprised",
    color: "#64B5F6",
    angle: 45,
    secondaryEmotions: [
      {
        name: "Amazed",
        color: "#90CAF9",
        tertiaryEmotions: [
          { name: "Awed", color: "#BBDEFB" },
          { name: "Astonished", color: "#64B5F6" }
        ]
      },
      {
        name: "Confused",
        color: "#42A5F5",
        tertiaryEmotions: [
          { name: "Eager", color: "#2196F3" },
          { name: "Energetic", color: "#1E88E5" }
        ]
      }
    ]
  },
  {
    name: "Bad",
    color: "#9575CD",
    angle: 135,
    secondaryEmotions: [
      {
        name: "Bored",
        color: "#B39DDB",
        tertiaryEmotions: [
          { name: "Indifferent", color: "#D1C4E9" },
          { name: "Apathetic", color: "#B39DDB" }
        ]
      },
      {
        name: "Busy",
        color: "#9575CD",
        tertiaryEmotions: [
          { name: "Rushed", color: "#7E57C2" },
          { name: "Pressured", color: "#673AB7" }
        ]
      }
    ]
  }
];

const EmotionWheel: React.FC<EmotionWheelProps> = ({ 
  selectedEmotion, 
  isProcessing,
  processingStage 
}) => {
  const [activePrimary, setActivePrimary] = useState<Primary | null>(null);
  const [activeSecondary, setActiveSecondary] = useState<Secondary | null>(null);
  const [activeTertiary, setActiveTertiary] = useState<Tertiary | null>(null);
  const [animationStage, setAnimationStage] = useState<number>(0);

  // Get emoji for emotion display
  const getEmoji = (emotion: string): string => {
    const emojiMap: Record<string, string> = {
      // Primary emotions
      "happy": "😊", "sad": "😔", "angry": "😠", "fearful": "😨", 
      "surprised": "😲", "peaceful": "😌", "disgusted": "🤢", "bad": "🙁",

      // Secondary emotions
      "optimistic": "😄", "trusting": "🤗", "lonely": "🥺", 
      "depressed": "😞", "mad": "😡", "frustrated": "😤",
      "scared": "😱", "anxious": "😰", "amazed": "😮", 
      "confused": "🤔", "content": "😌", "relaxed": "😎",
      "critical": "🧐", "disapproving": "👎",

      // Tertiary emotions
      "inspired": "✨", "hopeful": "🌱", "sensitive": "💞", 
      "intimate": "💖", "isolated": "🏝️", "abandoned": "🪦",
      "helpless": "⛈️", "hopeless": "🌧️", "furious": "🔥", 
      "enraged": "💢", "annoyed": "😒", "irritated": "😠",
      "terrified": "🙀", "panicked": "😱", "worried": "😟", 
      "nervous": "😬", "astonished": "😳", "awestruck": "🤩",
      "perplexed": "❓", "disillusioned": "💭", "satisfied": "👍", 
      "calm": "🧘", "serene": "🌊", "free": "🦋",
      "skeptical": "🤨", "dismissive": "🙄", "judgmental": "ಠ_ಠ",
      "embarrassed": "😳"
    };

    return emojiMap[emotion.toLowerCase()] || "🔍";
  };

  // Find the selected emotion in the wheel
  useEffect(() => {
    // Reset state
    setAnimationStage(0);
    setActivePrimary(null);
    setActiveSecondary(null);
    setActiveTertiary(null);

    if (!selectedEmotion) return;

    // Search for the emotion in the wheel
    let foundPrimary: Primary | null = null;
    let foundSecondary: Secondary | null = null;
    let foundTertiary: Tertiary | null = null;

    // First check for exact match in tertiary emotions
    emotionWheel.forEach(primary => {
      primary.secondaryEmotions.forEach(secondary => {
        secondary.tertiaryEmotions.forEach(tertiary => {
          if (tertiary.name.toLowerCase() === selectedEmotion.toLowerCase()) {
            foundPrimary = primary;
            foundSecondary = secondary;
            foundTertiary = tertiary;
          }
        });
      });
    });

    // If not found, check secondary emotions
    if (!foundPrimary) {
      emotionWheel.forEach(primary => {
        primary.secondaryEmotions.forEach(secondary => {
          if (secondary.name.toLowerCase() === selectedEmotion.toLowerCase()) {
            foundPrimary = primary;
            foundSecondary = secondary;
          }
        });
      });
    }

    // If still not found, check primary emotions
    if (!foundPrimary) {
      emotionWheel.forEach(primary => {
        if (primary.name.toLowerCase() === selectedEmotion.toLowerCase()) {
          foundPrimary = primary;
        }
      });
    }

    // Animate the emotion path with delays
    if (foundPrimary) {
      setTimeout(() => {
        setActivePrimary(foundPrimary);
        setAnimationStage(1);

        if (foundSecondary) {
          setTimeout(() => {
            setActiveSecondary(foundSecondary);
            setAnimationStage(2);

            if (foundTertiary) {
              setTimeout(() => {
                setActiveTertiary(foundTertiary);
                setAnimationStage(3);
              }, 500);
            }
          }, 500);
        }
      }, 300);
    }
  }, [selectedEmotion]);

  // Render a simplified wheel visualization
  return (
    <div className="emotion-visualization-container">
      <div className="simplified-wheel">
        {emotionWheel.map((primary, index) => (
          <div 
            key={primary.name}
            className={`emotion-segment primary ${activePrimary?.name === primary.name ? 'active' : ''}`}
            style={{
              backgroundColor: primary.color,
              transform: `rotate(${primary.angle}deg) translateX(80px)`,
            }}
          >
            <div className="emotion-tooltip">
              <span className="emotion-emoji">{getEmoji(primary.name)}</span>
              <span>{primary.name}</span>
            </div>
          </div>
        ))}

        {activePrimary && activePrimary.secondaryEmotions.map((secondary, index) => (
          <div 
            key={secondary.name}
            className={`emotion-segment secondary ${activeSecondary?.name === secondary.name ? 'active' : ''}`}
            style={{
              backgroundColor: secondary.color,
              transform: `rotate(${activePrimary.angle + (index * 15)}deg) translateX(120px)`,
              opacity: animationStage >= 1 ? 1 : 0
            }}
          >
            <div className="emotion-tooltip">
              <span className="emotion-emoji">{getEmoji(secondary.name)}</span>
              <span>{secondary.name}</span>
            </div>
          </div>
        ))}

        {activeSecondary && activePrimary && activeSecondary.tertiaryEmotions.map((tertiary, index) => (
          <div 
            key={tertiary.name}
            className={`emotion-segment tertiary ${activeTertiary?.name === tertiary.name ? 'active' : ''}`}
            style={{
              backgroundColor: tertiary.color,
              transform: `rotate(${activePrimary.angle + (index * 10)}deg) translateX(160px)`,
              opacity: animationStage >= 2 ? 1 : 0
            }}
          >
            <div className="emotion-tooltip">
              <span className="emotion-emoji">{getEmoji(tertiary.name)}</span>
              <span>{tertiary.name}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Emotion Path Display */}
      {selectedEmotion && (
        <div className="emotion-path-container">
          <div className={`emotion-path ${animationStage > 0 ? 'show' : ''}`}>
            <div className="path-title">Emotion Path</div>
            <div className="path-steps">
              {activePrimary && (
                <div className="path-step primary">
                  <div className="color-dot" style={{ backgroundColor: activePrimary.color }}></div>
                  <span>{getEmoji(activePrimary.name)} {activePrimary.name}</span>
                </div>
              )}

              {activePrimary && activeSecondary && (
                <>
                  <div className="path-arrow">→</div>
                  <div className="path-step secondary">
                    <div className="color-dot" style={{ backgroundColor: activeSecondary.color }}></div>
                    <span>{getEmoji(activeSecondary.name)} {activeSecondary.name}</span>
                  </div>
                </>
              )}

              {activePrimary && activeSecondary && activeTertiary && (
                <>
                  <div className="path-arrow">→</div>
                  <div className="path-step tertiary">
                    <div className="color-dot" style={{ backgroundColor: activeTertiary.color }}></div>
                    <span>{getEmoji(activeTertiary.name)} {activeTertiary.name}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="processing-overlay">
          <div className="processing-spinner"></div>
          <div className="processing-text">Analyzing emotional patterns...</div>
        </div>
      )}
    </div>
  );
};

export default EmotionWheel;