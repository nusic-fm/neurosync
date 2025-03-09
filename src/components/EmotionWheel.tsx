
import React, { useEffect, useState } from 'react';
import './EmotionWheel.css';

interface EmotionWheelProps {
  selectedEmotion: string | null;
  wheelRotation: number;
  isProcessing: boolean;
}

// Define emotion data structure
interface EmotionData {
  primary: {
    [key: string]: {
      color: string;
      angle: number;
      secondary: {
        [key: string]: {
          color: string;
          angle: number;
          tertiary: string[];
        };
      };
    };
  };
  mappings: {
    [key: string]: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
  };
}

const EmotionWheel: React.FC<EmotionWheelProps> = ({ 
  selectedEmotion, 
  wheelRotation, 
  isProcessing 
}) => {
  const [activePrimary, setActivePrimary] = useState<string | null>(null);
  const [activeSecondary, setActiveSecondary] = useState<string | null>(null);
  const [activeTertiary, setActiveTertiary] = useState<string | null>(null);
  const [animationStage, setAnimationStage] = useState<number>(0);
  
  // Emotion wheel data structure
  const emotions: EmotionData = {
    primary: {
      joy: {
        color: "#FFDE59",
        angle: 60,
        secondary: {
          serenity: {
            color: "#A0D6B4",
            angle: 30,
            tertiary: ["contentment", "bliss", "peaceful"]
          },
          ecstasy: {
            color: "#FFA500",
            angle: 60,
            tertiary: ["excited", "enthusiastic", "elated"]
          },
          love: {
            color: "#FF69B4",
            angle: 90,
            tertiary: ["adoration", "affection", "compassion"]
          }
        }
      },
      sadness: {
        color: "#5B92E5",
        angle: 180,
        secondary: {
          grief: {
            color: "#7869AA",
            angle: 150,
            tertiary: ["anguish", "heartbroken", "despair"]
          },
          melancholy: {
            color: "#6495ED",
            angle: 180,
            tertiary: ["nostalgia", "regret", "wistful"]
          },
          disappointment: {
            color: "#87CEEB",
            angle: 210,
            tertiary: ["disheartened", "dismayed", "upset"]
          }
        }
      },
      anger: {
        color: "#E53935",
        angle: 300,
        secondary: {
          rage: {
            color: "#B71C1C",
            angle: 270,
            tertiary: ["fury", "hostility", "outrage"]
          },
          irritation: {
            color: "#FF6347",
            angle: 300,
            tertiary: ["annoyed", "agitated", "frustrated"]
          },
          disgust: {
            color: "#9C27B0",
            angle: 330,
            tertiary: ["revulsion", "loathing", "aversion"]
          }
        }
      },
      fear: {
        color: "#8BC34A",
        angle: 240,
        secondary: {
          terror: {
            color: "#004D40",
            angle: 240,
            tertiary: ["horror", "panic", "dread"]
          },
          apprehension: {
            color: "#81C784",
            angle: 270,
            tertiary: ["worried", "anxious", "nervous"]
          }
        }
      },
      surprise: {
        color: "#29B6F6",
        angle: 120,
        secondary: {
          amazement: {
            color: "#00BCD4",
            angle: 120,
            tertiary: ["awe", "wonder", "astonishment"]
          },
          distraction: {
            color: "#80DEEA",
            angle: 150,
            tertiary: ["confusion", "disorientation", "bewilderment"]
          }
        }
      },
      neutral: {
        color: "#9E9E9E",
        angle: 0,
        secondary: {
          calmness: {
            color: "#B0BEC5",
            angle: 0,
            tertiary: ["composed", "collected", "tranquil"]
          }
        }
      }
    },
    mappings: {
      // Map API responses to our emotion structure
      happy: { primary: "joy", secondary: "ecstasy", tertiary: "enthusiastic" },
      sad: { primary: "sadness", secondary: "melancholy", tertiary: "wistful" },
      angry: { primary: "anger", secondary: "rage", tertiary: "fury" },
      fearful: { primary: "fear", secondary: "terror", tertiary: "panic" },
      surprised: { primary: "surprise", secondary: "amazement", tertiary: "astonishment" },
      disgusted: { primary: "anger", secondary: "disgust", tertiary: "revulsion" },
      neutral: { primary: "neutral", secondary: "calmness", tertiary: "composed" }
    }
  };

  useEffect(() => {
    if (selectedEmotion) {
      // Reset animation state
      setAnimationStage(0);
      
      // Map the selected emotion to our structure
      const mapping = emotions.mappings[selectedEmotion] || 
                      { primary: "neutral", secondary: "calmness", tertiary: "composed" };
      
      // Start animation sequence
      setActivePrimary(null);
      setActiveSecondary(null);
      setActiveTertiary(null);
      
      // Animate through the emotions in sequence
      setTimeout(() => {
        setActivePrimary(mapping.primary);
        setAnimationStage(1);
      }, 500);
      
      setTimeout(() => {
        setActiveSecondary(mapping.secondary);
        setAnimationStage(2);
      }, 1500);
      
      setTimeout(() => {
        setActiveTertiary(mapping.tertiary);
        setAnimationStage(3);
      }, 2500);
    } else {
      // Reset when no emotion is selected
      setActivePrimary(null);
      setActiveSecondary(null);
      setActiveTertiary(null);
      setAnimationStage(0);
    }
  }, [selectedEmotion]);

  // Generate wheel sections
  const renderPrimaryEmotions = () => {
    return Object.entries(emotions.primary).map(([emotion, data]) => {
      const isActive = activePrimary === emotion;
      const style = {
        backgroundColor: data.color,
        transform: `rotate(${data.angle}deg)`,
        opacity: activePrimary ? (isActive ? 1 : 0.3) : 1
      };
      
      return (
        <div 
          key={emotion}
          className={`primary-emotion ${isActive ? 'active' : ''}`}
          style={style}
        >
          <span className="emotion-label">{emotion}</span>
        </div>
      );
    });
  };

  const renderSecondaryEmotions = () => {
    if (!activePrimary) return null;
    
    const primaryData = emotions.primary[activePrimary];
    return Object.entries(primaryData.secondary).map(([emotion, data]) => {
      const isActive = activeSecondary === emotion;
      const style = {
        backgroundColor: data.color,
        transform: `rotate(${data.angle}deg)`,
        opacity: activeSecondary ? (isActive ? 1 : 0.3) : 0.7
      };
      
      return (
        <div 
          key={emotion}
          className={`secondary-emotion ${isActive ? 'active' : ''} ${animationStage >= 2 ? 'show' : ''}`}
          style={style}
        >
          <span className="emotion-label">{emotion}</span>
        </div>
      );
    });
  };

  const renderTertiaryEmotions = () => {
    if (!activePrimary || !activeSecondary) return null;
    
    const secondaryData = emotions.primary[activePrimary].secondary[activeSecondary];
    return secondaryData.tertiary.map((emotion, index) => {
      const isActive = activeTertiary === emotion;
      const angle = secondaryData.angle - 15 + (index * 15);
      const style = {
        backgroundColor: secondaryData.color,
        transform: `rotate(${angle}deg)`,
        opacity: activeTertiary ? (isActive ? 1 : 0.3) : 0.7,
        filter: 'brightness(1.1)'
      };
      
      return (
        <div 
          key={emotion}
          className={`tertiary-emotion ${isActive ? 'active' : ''} ${animationStage >= 3 ? 'show' : ''}`}
          style={style}
        >
          <span className="emotion-label">{emotion}</span>
        </div>
      );
    });
  };

  return (
    <div className="emotion-wheel-container">
      <div className="wheel-pointer"></div>
      <div 
        className={`emotion-wheel ${isProcessing ? 'processing' : ''}`} 
        style={{ transform: isProcessing ? `rotate(${wheelRotation}deg)` : 'rotate(0deg)' }}
      >
        <div className="wheel-center"></div>
        <div className="primary-wheel">{renderPrimaryEmotions()}</div>
        <div className="secondary-wheel">{renderSecondaryEmotions()}</div>
        <div className="tertiary-wheel">{renderTertiaryEmotions()}</div>
        
        {selectedEmotion && (
          <div className="emotion-result">
            <div className="emotion-path">
              {activePrimary && <span className="primary-label">{activePrimary}</span>}
              {activePrimary && activeSecondary && <span className="arrow">→</span>}
              {activeSecondary && <span className="secondary-label">{activeSecondary}</span>}
              {activeSecondary && activeTertiary && <span className="arrow">→</span>}
              {activeTertiary && <span className="tertiary-label">{activeTertiary}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmotionWheel;
