
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
      angle: 60,
      secondaryEmotions: [
        {
          name: "serenity",
          color: "#A0D6B4",
          angle: 30,
          tertiaryEmotions: [
            { name: "contentment", color: "#B8E0D2" },
            { name: "peaceful", color: "#8ED1BD" },
            { name: "bliss", color: "#A0D6B4" }
          ]
        },
        {
          name: "ecstasy",
          color: "#FFA500",
          angle: 60,
          tertiaryEmotions: [
            { name: "excited", color: "#FFB84D" },
            { name: "enthusiastic", color: "#FFC266" },
            { name: "elated", color: "#FFD699" }
          ]
        },
        {
          name: "love",
          color: "#FF69B4",
          angle: 90,
          tertiaryEmotions: [
            { name: "adoration", color: "#FF99CC" },
            { name: "affection", color: "#FF80BF" },
            { name: "compassion", color: "#FF69B4" }
          ]
        }
      ]
    },
    {
      name: "sadness",
      color: "#5B92E5",
      angle: 180,
      secondaryEmotions: [
        {
          name: "grief",
          color: "#7869AA",
          angle: 150,
          tertiaryEmotions: [
            { name: "anguish", color: "#8F7FC2" },
            { name: "heartbroken", color: "#9C8DCF" },
            { name: "despair", color: "#7869AA" }
          ]
        },
        {
          name: "melancholy",
          color: "#6495ED",
          angle: 180,
          tertiaryEmotions: [
            { name: "nostalgia", color: "#82A9F0" },
            { name: "regret", color: "#93B4F2" },
            { name: "wistful", color: "#6495ED" }
          ]
        },
        {
          name: "disappointment",
          color: "#87CEEB",
          angle: 210,
          tertiaryEmotions: [
            { name: "dejected", color: "#A5DAF1" },
            { name: "disheartened", color: "#9CD4EF" },
            { name: "dismayed", color: "#87CEEB" }
          ]
        }
      ]
    },
    {
      name: "fear",
      color: "#A875FF",
      angle: 300,
      secondaryEmotions: [
        {
          name: "horror",
          color: "#9966CC",
          angle: 270,
          tertiaryEmotions: [
            { name: "terrified", color: "#B088D1" },
            { name: "dread", color: "#A569BD" },
            { name: "panic", color: "#9966CC" }
          ]
        },
        {
          name: "anxiety",
          color: "#BA55D3",
          angle: 300,
          tertiaryEmotions: [
            { name: "nervous", color: "#C77DDB" },
            { name: "worried", color: "#E3D4E6" },
            { name: "stressed", color: "#BA55D3" }
          ]
        },
        {
          name: "insecurity",
          color: "#D8BFD8",
          angle: 330,
          tertiaryEmotions: [
            { name: "vulnerable", color: "#E6D7E6" },
            { name: "inadequate", color: "#DFCBDF" },
            { name: "helpless", color: "#D8BFD8" }
          ]
        }
      ]
    },
    {
      name: "anger",
      color: "#FF5757",
      angle: 0,
      secondaryEmotions: [
        {
          name: "rage",
          color: "#FF0000",
          angle: 0,
          tertiaryEmotions: [
            { name: "furious", color: "#FF4D4D" },
            { name: "outraged", color: "#FF3333" },
            { name: "vengeful", color: "#FF0000" }
          ]
        },
        {
          name: "irritation",
          color: "#FF6347",
          angle: 30,
          tertiaryEmotions: [
            { name: "annoyed", color: "#FF8573" },
            { name: "frustrated", color: "#FF745F" },
            { name: "aggravated", color: "#FF6347" }
          ]
        },
        {
          name: "disgust",
          color: "#CD5C5C",
          angle: 330,
          tertiaryEmotions: [
            { name: "revolted", color: "#D78080" },
            { name: "contempt", color: "#D26D6D" },
            { name: "repulsed", color: "#CD5C5C" }
          ]
        }
      ]
    },
    {
      name: "surprise",
      color: "#FFFC59",
      angle: 120,
      secondaryEmotions: [
        {
          name: "amazement",
          color: "#FFD700",
          angle: 120,
          tertiaryEmotions: [
            { name: "astonished", color: "#FFDF33" },
            { name: "awestruck", color: "#FFE666" },
            { name: "wonderment", color: "#FFD700" }
          ]
        },
        {
          name: "confusion",
          color: "#FADA5E",
          angle: 150,
          tertiaryEmotions: [
            { name: "perplexed", color: "#FBE27F" },
            { name: "disillusioned", color: "#FBDF6F" },
            { name: "bewildered", color: "#FADA5E" }
          ]
        },
        {
          name: "excitement",
          color: "#FFFF00",
          angle: 90,
          tertiaryEmotions: [
            { name: "eager", color: "#FFFF4D" },
            { name: "energetic", color: "#FFFF33" },
            { name: "thrilled", color: "#FFFF00" }
          ]
        }
      ]
    }
  ];

  // Find all emotion related to the selected emotion
  useEffect(() => {
    if (!selectedEmotion) {
      setActivePrimary(null);
      setActiveSecondary(null);
      setActiveTertiary(null);
      setAnimationStage(0);
      return;
    }

    const normalizedEmotion = selectedEmotion.toLowerCase().trim();
    
    // Animation sequence
    setAnimationStage(0);
    
    // First look for primary emotions
    const primary = emotionWheel.find(
      p => p.name.toLowerCase() === normalizedEmotion
    );
    
    if (primary) {
      setTimeout(() => {
        setActivePrimary(primary);
        setActiveSecondary(null);
        setActiveTertiary(null);
        setAnimationStage(1);
      }, 300);
      return;
    }
    
    // Look for secondary emotions
    for (const primary of emotionWheel) {
      const secondary = primary.secondaryEmotions.find(
        s => s.name.toLowerCase() === normalizedEmotion
      );
      
      if (secondary) {
        setTimeout(() => {
          setActivePrimary(primary);
          setAnimationStage(1);
          
          setTimeout(() => {
            setActiveSecondary(secondary);
            setActiveTertiary(null);
            setAnimationStage(2);
          }, 1000);
        }, 300);
        return;
      }
      
      // Look for tertiary emotions
      for (const secondary of primary.secondaryEmotions) {
        const tertiary = secondary.tertiaryEmotions.find(
          t => t.name.toLowerCase() === normalizedEmotion
        );
        
        if (tertiary) {
          setTimeout(() => {
            setActivePrimary(primary);
            setAnimationStage(1);
            
            setTimeout(() => {
              setActiveSecondary(secondary);
              setAnimationStage(2);
              
              setTimeout(() => {
                setActiveTertiary(tertiary);
                setAnimationStage(3);
              }, 1000);
            }, 1000);
          }, 300);
          return;
        }
      }
    }
    
    // If no exact match, set a default
    setTimeout(() => {
      setActivePrimary(emotionWheel[0]);
      setActiveSecondary(null);
      setActiveTertiary(null);
      setAnimationStage(1);
    }, 300);
    
  }, [selectedEmotion]);

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
            transform: `rotate(${rotationAngle}deg) skew(${90 - sliceAngle}deg)`,
            opacity: activePrimary ? (isActive ? 1 : 0.3) : 1
          }}
        >
          <span 
            className="emotion-label"
            style={{
              transform: `skew(${-(90 - sliceAngle)}deg) rotate(${-(rotationAngle + sliceAngle/2)}deg)`,
              transformOrigin: 'center',
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
          className={`emotion-slice secondary-emotion ${isActive ? 'active' : ''} ${animationStage >= 2 ? 'show' : ''}`}
          style={{
            backgroundColor: emotion.color,
            transform: `rotate(${rotationAngle}deg) skew(${90 - sliceAngle}deg)`,
            opacity: activeSecondary ? (isActive ? 1 : 0.3) : 0.7
          }}
        >
          <span 
            className="emotion-label"
            style={{
              transform: `skew(${-(90 - sliceAngle)}deg) rotate(${-(rotationAngle + sliceAngle/2)}deg)`,
              transformOrigin: 'center',
            }}
          >
            {emotion.name}
          </span>
        </div>
      );
    });
  };

  const renderTertiaryEmotions = () => {
    if (!activePrimary || !activeSecondary) return null;
    
    return activeSecondary.tertiaryEmotions.map((emotion, index) => {
      const numberOfSlices = activeSecondary.tertiaryEmotions.length;
      const sliceAngle = 360 / numberOfSlices;
      const rotationAngle = index * sliceAngle;
      
      const isActive = activeTertiary?.name === emotion.name;
      
      return (
        <div
          key={emotion.name}
          className={`emotion-slice tertiary-emotion ${isActive ? 'active' : ''} ${animationStage >= 3 ? 'show' : ''}`}
          style={{
            backgroundColor: emotion.color,
            transform: `rotate(${rotationAngle}deg) skew(${90 - sliceAngle}deg)`,
            opacity: activeTertiary ? (isActive ? 1 : 0.3) : 0.7
          }}
        >
          <span 
            className="emotion-label"
            style={{
              transform: `skew(${-(90 - sliceAngle)}deg) rotate(${-(rotationAngle + sliceAngle/2)}deg)`,
              transformOrigin: 'center',
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
                <div className={`path-step secondary ${animationStage >= 2 ? 'show' : ''}`}>
                  <div className="color-dot" style={{ backgroundColor: activeSecondary.color }}></div>
                  <span>{activeSecondary.name}</span>
                </div>
              </>
            )}
            
            {activePrimary && activeSecondary && activeTertiary && (
              <>
                <div className="path-arrow">→</div>
                <div className={`path-step tertiary ${animationStage >= 3 ? 'show' : ''}`}>
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
