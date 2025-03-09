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
  angle: number;
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

  // Define the emotion wheel structure
  const emotionWheel: Primary[] = [
    {
      name: "joy",
      color: "#FFDE59",
      angle: 0,
      secondaryEmotions: [
        {
          name: "serenity",
          color: "#A0D6B4",
          angle: 0,
          tertiaryEmotions: [
            { name: "contentment", color: "#B8E0D2" },
            { name: "peaceful", color: "#8ED1BD" },
            { name: "bliss", color: "#A0D6B4" }
          ]
        },
        {
          name: "happiness",
          color: "#FFA500",
          angle: 30,
          tertiaryEmotions: [
            { name: "cheerful", color: "#FFB84D" },
            { name: "delighted", color: "#FFC266" },
            { name: "amused", color: "#FFD699" }
          ]
        },
        {
          name: "ecstasy",
          color: "#FF69B4",
          angle: 60,
          tertiaryEmotions: [
            { name: "excited", color: "#FF99CC" },
            { name: "elated", color: "#FF80BF" },
            { name: "euphoric", color: "#FF69B4" }
          ]
        }
      ]
    },
    {
      name: "love",
      color: "#FF5E78",
      angle: 60,
      secondaryEmotions: [
        {
          name: "affection",
          color: "#FF8FA3",
          angle: 60,
          tertiaryEmotions: [
            { name: "fondness", color: "#FFAAB9" },
            { name: "liking", color: "#FF97A8" },
            { name: "caring", color: "#FF8FA3" }
          ]
        },
        {
          name: "romance",
          color: "#FF4D6D",
          angle: 90,
          tertiaryEmotions: [
            { name: "attraction", color: "#FF6B84" },
            { name: "passion", color: "#FF5E78" },
            { name: "infatuation", color: "#FF4D6D" }
          ]
        },
        {
          name: "compassion",
          color: "#FB6F92",
          angle: 120,
          tertiaryEmotions: [
            { name: "empathy", color: "#FCA5BC" },
            { name: "sympathy", color: "#FB8DAB" },
            { name: "kindness", color: "#FB6F92" }
          ]
        }
      ]
    },
    {
      name: "anger",
      color: "#E63946",
      angle: 120,
      secondaryEmotions: [
        {
          name: "annoyance",
          color: "#F28482",
          angle: 120,
          tertiaryEmotions: [
            { name: "irritation", color: "#F7AEA2" },
            { name: "agitation", color: "#F5918E" },
            { name: "frustration", color: "#F28482" }
          ]
        },
        {
          name: "rage",
          color: "#D00000",
          angle: 150,
          tertiaryEmotions: [
            { name: "hostility", color: "#E63946" },
            { name: "fury", color: "#DC1C13" },
            { name: "hatred", color: "#D00000" }
          ]
        },
        {
          name: "disgust",
          color: "#9D0208",
          angle: 180,
          tertiaryEmotions: [
            { name: "aversion", color: "#BF0603" },
            { name: "revulsion", color: "#A71D31" },
            { name: "loathing", color: "#9D0208" }
          ]
        }
      ]
    },
    {
      name: "sadness",
      color: "#457B9D",
      angle: 180,
      secondaryEmotions: [
        {
          name: "disappointment",
          color: "#6D97A9",
          angle: 180,
          tertiaryEmotions: [
            { name: "dismay", color: "#8FB3C9" },
            { name: "regret", color: "#7DA3B9" },
            { name: "letdown", color: "#6D97A9" }
          ]
        },
        {
          name: "grief",
          color: "#1D3557",
          angle: 210,
          tertiaryEmotions: [
            { name: "heartbroken", color: "#2A4A73" },
            { name: "anguish", color: "#284066" },
            { name: "despair", color: "#1D3557" }
          ]
        },
        {
          name: "loneliness",
          color: "#3D5A80",
          angle: 240,
          tertiaryEmotions: [
            { name: "isolated", color: "#4D6E9A" },
            { name: "abandoned", color: "#41628C" },
            { name: "neglected", color: "#3D5A80" }
          ]
        }
      ]
    },
    {
      name: "fear",
      color: "#7209B7",
      angle: 240,
      secondaryEmotions: [
        {
          name: "anxiety",
          color: "#9D4EDD",
          angle: 240,
          tertiaryEmotions: [
            { name: "worry", color: "#B088F9" },
            { name: "nervousness", color: "#A459D1" },
            { name: "unease", color: "#9D4EDD" }
          ]
        },
        {
          name: "terror",
          color: "#5A189A",
          angle: 270,
          tertiaryEmotions: [
            { name: "horror", color: "#6F2DBD" },
            { name: "panic", color: "#6823B2" },
            { name: "dread", color: "#5A189A" }
          ]
        },
        {
          name: "insecurity",
          color: "#3C096C",
          angle: 300,
          tertiaryEmotions: [
            { name: "inadequacy", color: "#4E148C" },
            { name: "helplessness", color: "#430E7C" },
            { name: "vulnerability", color: "#3C096C" }
          ]
        }
      ]
    },
    {
      name: "surprise",
      color: "#4CC9F0",
      angle: 300,
      secondaryEmotions: [
        {
          name: "amazement",
          color: "#80D8F7",
          angle: 300,
          tertiaryEmotions: [
            { name: "awe", color: "#A9E4FA" },
            { name: "wonder", color: "#96DEF9" },
            { name: "astonishment", color: "#80D8F7" }
          ]
        },
        {
          name: "shock",
          color: "#4361EE",
          angle: 330,
          tertiaryEmotions: [
            { name: "bewilderment", color: "#5472F7" },
            { name: "disbelief", color: "#4895EF" },
            { name: "confusion", color: "#4361EE" }
          ]
        },
        {
          name: "distraction",
          color: "#3F37C9",
          angle: 360,
          tertiaryEmotions: [
            { name: "overwhelmed", color: "#4D43E8" },
            { name: "dazed", color: "#463AD8" },
            { name: "disoriented", color: "#3F37C9" }
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
            clipPath: `polygon(0 0, 200% 0, 100% 100%, 0 100%)`, //Corrected clipPath
            opacity: activePrimary ? (isActive ? 1 : 0.3) : 0.7
          }}
        >
          <span 
            className="emotion-label"
            style={{
              transform: `rotate(${-rotationAngle + (sliceAngle/2)}deg)`,
              transformOrigin: 'bottom left',
              top: '40%',
              left: '30%'
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
            clipPath: `polygon(0 0, 200% 0, 100% 100%, 0 100%)`, //Corrected clipPath
            opacity: activeSecondary ? (isActive ? 1 : 0.3) : 0.7
          }}
        >
          <span 
            className="emotion-label"
            style={{
              transform: `rotate(${-rotationAngle + (sliceAngle/2)}deg)`,
              transformOrigin: 'bottom left',
              top: '40%',
              left: '30%'
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
            clipPath: `polygon(0 0, 200% 0, 100% 100%, 0 100%)`, //Corrected clipPath
            opacity: activeTertiary ? (isActive ? 1 : 0.3) : 0.7
          }}
        >
          <span 
            className="emotion-label"
            style={{
              transform: `rotate(${-rotationAngle + (sliceAngle/2)}deg)`,
              transformOrigin: 'bottom left',
              top: '40%',
              left: '30%'
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