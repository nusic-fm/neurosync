
import React, { useEffect, useState } from 'react';
import './EmotionWheel.css';

interface EmotionWheelProps {
  selectedEmotion: string | null;
  wheelRotation: number;
  isProcessing: boolean;
}

// Emotion wheel data structure
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

const EmotionWheel: React.FC<EmotionWheelProps> = ({ 
  selectedEmotion, 
  wheelRotation, 
  isProcessing 
}) => {
  // States for active emotions and animation
  const [activePrimary, setActivePrimary] = useState<Primary | null>(null);
  const [activeSecondary, setActiveSecondary] = useState<Secondary | null>(null);
  const [activeTertiary, setActiveTertiary] = useState<Tertiary | null>(null);
  const [animationStage, setAnimationStage] = useState<number>(0);

  // Define the emotion wheel structure based on the CSV
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
        },
        {
          name: "Proud",
          color: "#FFCA28",
          tertiaryEmotions: [
            { name: "Confident", color: "#FFD54F" },
            { name: "Successful", color: "#FFC107" }
          ]
        },
        {
          name: "Content",
          color: "#FFC107",
          tertiaryEmotions: [
            { name: "Free", color: "#FFCA28" },
            { name: "Joyful", color: "#FFB300" }
          ]
        },
        {
          name: "Playful",
          color: "#FFB300",
          tertiaryEmotions: [
            { name: "Cheeky", color: "#FFA000" },
            { name: "Aroused", color: "#FF8F00" }
          ]
        },
        {
          name: "Interested",
          color: "#FF8F00",
          tertiaryEmotions: [
            { name: "Curious", color: "#FF9800" },
            { name: "Inquisitive", color: "#F57C00" }
          ]
        },
        {
          name: "Accepted",
          color: "#FF9800",
          tertiaryEmotions: [
            { name: "Respected", color: "#FFA726" },
            { name: "Valued", color: "#FB8C00" }
          ]
        },
        {
          name: "Peaceful",
          color: "#FB8C00",
          tertiaryEmotions: [
            { name: "Thankful", color: "#FF9800" },
            { name: "Loving", color: "#F57C00" }
          ]
        }
      ]
    },
    {
      name: "Surprised",
      color: "#9C27B0",
      angle: 45,
      secondaryEmotions: [
        {
          name: "Amazed",
          color: "#BA68C8",
          tertiaryEmotions: [
            { name: "Awed", color: "#CE93D8" },
            { name: "Astonished", color: "#AB47BC" }
          ]
        },
        {
          name: "Confused",
          color: "#8E24AA",
          tertiaryEmotions: [
            { name: "Eager", color: "#AB47BC" },
            { name: "Energetic", color: "#7B1FA2" }
          ]
        },
        {
          name: "Excited",
          color: "#7B1FA2",
          tertiaryEmotions: [
            { name: "Overjoyed", color: "#9C27B0" },
            { name: "Enthusiastic", color: "#6A1B9A" }
          ]
        },
        {
          name: "Startled",
          color: "#6A1B9A",
          tertiaryEmotions: [
            { name: "Shocked", color: "#8E24AA" },
            { name: "Dismayed", color: "#4A148C" }
          ]
        }
      ]
    },
    {
      name: "Sad",
      color: "#5E35B1",
      angle: 90,
      secondaryEmotions: [
        {
          name: "Lonely",
          color: "#9575CD",
          tertiaryEmotions: [
            { name: "Abandoned", color: "#B39DDB" },
            { name: "Victimized", color: "#7E57C2" }
          ]
        },
        {
          name: "Vulnerable",
          color: "#7E57C2",
          tertiaryEmotions: [
            { name: "Fragile", color: "#9575CD" },
            { name: "Grief", color: "#673AB7" }
          ]
        },
        {
          name: "Guilty",
          color: "#673AB7",
          tertiaryEmotions: [
            { name: "Ashamed", color: "#7E57C2" },
            { name: "Remorseful", color: "#5E35B1" }
          ]
        },
        {
          name: "Depressed",
          color: "#5E35B1",
          tertiaryEmotions: [
            { name: "Empty", color: "#673AB7" },
            { name: "Inferior", color: "#512DA8" }
          ]
        },
        {
          name: "Hurt",
          color: "#512DA8",
          tertiaryEmotions: [
            { name: "Disappointed", color: "#673AB7" },
            { name: "Embarrassed", color: "#4527A0" }
          ]
        }
      ]
    },
    {
      name: "Bad",
      color: "#3949AB",
      angle: 135,
      secondaryEmotions: [
        {
          name: "Bored",
          color: "#7986CB",
          tertiaryEmotions: [
            { name: "Indifferent", color: "#9FA8DA" },
            { name: "Apathetic", color: "#5C6BC0" }
          ]
        },
        {
          name: "Busy",
          color: "#5C6BC0",
          tertiaryEmotions: [
            { name: "Rushed", color: "#7986CB" },
            { name: "Pressured", color: "#3F51B5" }
          ]
        },
        {
          name: "Stressed",
          color: "#3F51B5",
          tertiaryEmotions: [
            { name: "Overwhelmed", color: "#5C6BC0" },
            { name: "Out of control", color: "#3949AB" }
          ]
        },
        {
          name: "Tired",
          color: "#3949AB",
          tertiaryEmotions: [
            { name: "Sleepy", color: "#3F51B5" },
            { name: "Unfocused", color: "#303F9F" }
          ]
        }
      ]
    },
    {
      name: "Fearful",
      color: "#1E88E5",
      angle: 180,
      secondaryEmotions: [
        {
          name: "Scared",
          color: "#64B5F6",
          tertiaryEmotions: [
            { name: "Helpless", color: "#90CAF9" },
            { name: "Frightened", color: "#42A5F5" }
          ]
        },
        {
          name: "Anxious",
          color: "#42A5F5",
          tertiaryEmotions: [
            { name: "Worried", color: "#64B5F6" },
            { name: "Insecure", color: "#2196F3" }
          ]
        },
        {
          name: "Weak",
          color: "#2196F3",
          tertiaryEmotions: [
            { name: "Worthless", color: "#42A5F5" },
            { name: "Insignificant", color: "#1E88E5" }
          ]
        },
        {
          name: "Rejected",
          color: "#1E88E5",
          tertiaryEmotions: [
            { name: "Inadequate", color: "#2196F3" },
            { name: "Inferior", color: "#1976D2" }
          ]
        },
        {
          name: "Threatened",
          color: "#1976D2",
          tertiaryEmotions: [
            { name: "Nervous", color: "#2196F3" },
            { name: "Exposed", color: "#1565C0" }
          ]
        }
      ]
    },
    {
      name: "Angry",
      color: "#E53935",
      angle: 225,
      secondaryEmotions: [
        {
          name: "Let down",
          color: "#EF5350",
          tertiaryEmotions: [
            { name: "Betrayed", color: "#EF9A9A" },
            { name: "Resentful", color: "#E57373" }
          ]
        },
        {
          name: "Humiliated",
          color: "#E57373",
          tertiaryEmotions: [
            { name: "Disrespected", color: "#EF5350" },
            { name: "Ridiculed", color: "#F44336" }
          ]
        },
        {
          name: "Bitter",
          color: "#F44336",
          tertiaryEmotions: [
            { name: "Indignant", color: "#E57373" },
            { name: "Violated", color: "#E53935" }
          ]
        },
        {
          name: "Mad",
          color: "#E53935",
          tertiaryEmotions: [
            { name: "Furious", color: "#F44336" },
            { name: "Jealous", color: "#D32F2F" }
          ]
        },
        {
          name: "Aggressive",
          color: "#D32F2F",
          tertiaryEmotions: [
            { name: "Provoked", color: "#E53935" },
            { name: "Hostile", color: "#C62828" }
          ]
        },
        {
          name: "Frustrated",
          color: "#C62828",
          tertiaryEmotions: [
            { name: "Infuriated", color: "#D32F2F" },
            { name: "Annoyed", color: "#B71C1C" }
          ]
        },
        {
          name: "Distant",
          color: "#B71C1C",
          tertiaryEmotions: [
            { name: "Withdrawn", color: "#C62828" },
            { name: "Numb", color: "#D50000" }
          ]
        }
      ]
    },
    {
      name: "Disgusted",
      color: "#00897B",
      angle: 315,
      secondaryEmotions: [
        {
          name: "Critical",
          color: "#4DB6AC",
          tertiaryEmotions: [
            { name: "Skeptical", color: "#80CBC4" },
            { name: "Dismissive", color: "#26A69A" }
          ]
        },
        {
          name: "Disapproving",
          color: "#26A69A",
          tertiaryEmotions: [
            { name: "Judgmental", color: "#4DB6AC" },
            { name: "Embarrassed", color: "#009688" }
          ]
        },
        {
          name: "Disappointed",
          color: "#009688",
          tertiaryEmotions: [
            { name: "Appalled", color: "#26A69A" },
            { name: "Revolted", color: "#00897B" }
          ]
        },
        {
          name: "Awful",
          color: "#00897B",
          tertiaryEmotions: [
            { name: "Nauseated", color: "#009688" },
            { name: "Detestable", color: "#00796B" }
          ]
        },
        {
          name: "Repelled",
          color: "#00796B",
          tertiaryEmotions: [
            { name: "Horrified", color: "#00897B" },
            { name: "Hesitant", color: "#00695C" }
          ]
        }
      ]
    }
  ];

  // Find the matching emotion in the wheel structure
  useEffect(() => {
    // Reset animation stage when emotion changes
    setAnimationStage(0);
    setActivePrimary(null);
    setActiveSecondary(null);
    setActiveTertiary(null);

    if (!selectedEmotion) return;

    // Find the closest matching emotions
    let foundPrimary: Primary | null = null;
    let foundSecondary: Secondary | null = null;
    let foundTertiary: Tertiary | null = null;

    // First check for exact tertiary emotion match
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

    // If no tertiary match, check for secondary
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

    // If still no match, check for primary
    if (!foundPrimary) {
      emotionWheel.forEach(primary => {
        if (primary.name.toLowerCase() === selectedEmotion.toLowerCase()) {
          foundPrimary = primary;
        }
      });
    }

    // If we have any match, begin the animation sequence
    if (foundPrimary) {
      // Set a timeout to allow wheel to finish rotating first
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
              }, 1000);
            }
          }, 1000);
        }
      }, 500);
    }
  }, [selectedEmotion, wheelRotation]);

  // Render functions
  const renderPrimaryEmotions = () => {
    return emotionWheel.map((emotion, index) => {
      const numberOfSlices = emotionWheel.length;
      const sliceAngle = 360 / numberOfSlices;
      const rotationAngle = index * sliceAngle;

      const isActive = activePrimary?.name === emotion.name;

      return (
        <div
          key={emotion.name}
          className={`emotion-slice primary-emotion ${isActive ? 'active' : ''}`}
          style={{
            backgroundColor: emotion.color,
            transform: `rotate(${rotationAngle}deg)`,
            clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%)`,
            opacity: activePrimary ? (isActive ? 1 : 0.3) : 0.7
          }}
        >
          <span 
            className="emotion-label"
            style={{
              transform: `rotate(${-rotationAngle + (sliceAngle/2)}deg)`,
              transformOrigin: 'center center',
            }}
          >
            {emotion.name}
          </span>
        </div>
      );
    });
  };

  const renderSecondaryEmotions = () => {
    if (!activePrimary) return null;

    return activePrimary.secondaryEmotions.map((emotion, index) => {
      const numberOfSlices = activePrimary.secondaryEmotions.length;
      const sliceAngle = 360 / numberOfSlices;
      const rotationAngle = index * sliceAngle;

      const isActive = activeSecondary?.name === emotion.name;

      return (
        <div
          key={emotion.name}
          className={`emotion-slice secondary-emotion ${isActive ? 'active' : ''}`}
          style={{
            backgroundColor: emotion.color,
            transform: `rotate(${rotationAngle}deg)`,
            clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%)`,
            opacity: activeSecondary ? (isActive ? 1 : 0.3) : 0.7
          }}
        >
          <span 
            className="emotion-label"
            style={{
              transform: `rotate(${-rotationAngle + (sliceAngle/2)}deg)`,
              transformOrigin: 'center center',
            }}
          >
            {emotion.name}
          </span>
        </div>
      );
    });
  };

  const renderTertiaryEmotions = () => {
    if (!activeSecondary) return null;

    return activeSecondary.tertiaryEmotions.map((emotion, index) => {
      const numberOfSlices = activeSecondary.tertiaryEmotions.length;
      const sliceAngle = 360 / numberOfSlices;
      const rotationAngle = index * sliceAngle;

      const isActive = activeTertiary?.name === emotion.name;

      return (
        <div
          key={emotion.name}
          className={`emotion-slice tertiary-emotion ${isActive ? 'active' : ''}`}
          style={{
            backgroundColor: emotion.color,
            transform: `rotate(${rotationAngle}deg)`,
            clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%)`,
            opacity: activeTertiary ? (isActive ? 1 : 0.3) : 0.7
          }}
        >
          <span 
            className="emotion-label"
            style={{
              transform: `rotate(${-rotationAngle + (sliceAngle/2)}deg)`,
              transformOrigin: 'center center',
            }}
          >
            {emotion.name}
          </span>
        </div>
      );
    });
  };

  return (
    <div className="emotion-wheel-container">
      <div className="wheel-pointer"></div>
      <div 
        className={`emotion-wheel ${isProcessing ? 'processing' : ''}`} 
        style={{ 
          transform: `rotate(${wheelRotation}deg)`,
          '--rotation': `${wheelRotation}deg`
        } as React.CSSProperties}
      >
        <div className="wheel-center">
          {animationStage > 0 && <div className="pulse-ring"></div>}
        </div>

        <div className="primary-wheel">
          {renderPrimaryEmotions()}
        </div>

        {activePrimary && (
          <div className={`secondary-wheel ${animationStage >= 2 ? 'active' : ''}`}>
            {renderSecondaryEmotions()}
          </div>
        )}

        {activePrimary && activeSecondary && (
          <div className={`tertiary-wheel ${animationStage >= 3 ? 'active' : ''}`}>
            {renderTertiaryEmotions()}
          </div>
        )}
      </div>

      {selectedEmotion && (
        <div className="emotion-path-container">
          <div className={`emotion-path ${animationStage > 0 ? 'show' : ''}`}>
            {activePrimary && (
              <div className="path-step primary">
                <div className="color-dot" style={{ backgroundColor: activePrimary.color }}></div>
                <span>{activePrimary.name}</span>
              </div>
            )}

            {activePrimary && activeSecondary && (
              <>
                <div className="path-arrow">→</div>
                <div className="path-step secondary">
                  <div className="color-dot" style={{ backgroundColor: activeSecondary.color }}></div>
                  <span>{activeSecondary.name}</span>
                </div>
              </>
            )}

            {activePrimary && activeSecondary && activeTertiary && (
              <>
                <div className="path-arrow">→</div>
                <div className="path-step tertiary">
                  <div className="color-dot" style={{ backgroundColor: activeTertiary.color }}></div>
                  <span>{activeTertiary.name}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmotionWheel;
