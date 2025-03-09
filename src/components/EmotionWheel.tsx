import React, { useEffect, useState, useRef } from 'react';
import './EmotionWheel.css';

interface EmotionWheelProps {
  selectedEmotion: string | null;
  wheelRotation: number;
  isProcessing: boolean;
}

// Emotion data structure
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
  const [neuronNodes, setNeuronNodes] = useState<{x: number, y: number, z: number, color: string, size?: number}[]>([]);
  const [connections, setConnections] = useState<{source: number, target: number, active: boolean}[]>([]);

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

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
          color: "#F57C00",
          tertiaryEmotions: [
            { name: "Respected", color: "#FB8C00" },
            { name: "Valued", color: "#EF6C00" }
          ]
        },
        {
          name: "Peaceful",
          color: "#EF6C00",
          tertiaryEmotions: [
            { name: "Thankful", color: "#F57F17" },
            { name: "Loving", color: "#FF6F00" }
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
        },
        {
          name: "Excited",
          color: "#1E88E5",
          tertiaryEmotions: [
            { name: "Overjoyed", color: "#1976D2" },
            { name: "Enthusiastic", color: "#1565C0" }
          ]
        },
        {
          name: "Startled",
          color: "#1565C0",
          tertiaryEmotions: [
            { name: "Shocked", color: "#0D47A1" },
            { name: "Dismayed", color: "#0D47A1" }
          ]
        }
      ]
    },
    {
      name: "Sad",
      color: "#78909C",
      angle: 90,
      secondaryEmotions: [
        {
          name: "Lonely",
          color: "#B0BEC5",
          tertiaryEmotions: [
            { name: "Abandoned", color: "#CFD8DC" },
            { name: "Victimized", color: "#B0BEC5" }
          ]
        },
        {
          name: "Vulnerable",
          color: "#90A4AE",
          tertiaryEmotions: [
            { name: "Fragile", color: "#78909C" },
            { name: "Grief", color: "#607D8B" }
          ]
        },
        {
          name: "Guilty",
          color: "#607D8B",
          tertiaryEmotions: [
            { name: "Ashamed", color: "#546E7A" },
            { name: "Remorseful", color: "#455A64" }
          ]
        },
        {
          name: "Depressed",
          color: "#455A64",
          tertiaryEmotions: [
            { name: "Empty", color: "#37474F" },
            { name: "Inferior", color: "#37474F" }
          ]
        },
        {
          name: "Hurt",
          color: "#37474F",
          tertiaryEmotions: [
            { name: "Disappointed", color: "#263238" },
            { name: "Embarrassed", color: "#263238" }
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
        },
        {
          name: "Stressed",
          color: "#673AB7",
          tertiaryEmotions: [
            { name: "Overwhelmed", color: "#5E35B1" },
            { name: "Out of control", color: "#512DA8" }
          ]
        },
        {
          name: "Tired",
          color: "#512DA8",
          tertiaryEmotions: [
            { name: "Sleepy", color: "#4527A0" },
            { name: "Unfocused", color: "#311B92" }
          ]
        }
      ]
    },
    {
      name: "Fearful",
      color: "#4DB6AC",
      angle: 180,
      secondaryEmotions: [
        {
          name: "Scared",
          color: "#80CBC4",
          tertiaryEmotions: [
            { name: "Helpless", color: "#B2DFDB" },
            { name: "Frightened", color: "#80CBC4" }
          ]
        },
        {
          name: "Anxious",
          color: "#4DB6AC",
          tertiaryEmotions: [
            { name: "Worried", color: "#26A69A" },
            { name: "Insecure", color: "#009688" }
          ]
        },
        {
          name: "Weak",
          color: "#009688",
          tertiaryEmotions: [
            { name: "Worthless", color: "#00897B" },
            { name: "Insignificant", color: "#00796B" }
          ]
        },
        {
          name: "Rejected",
          color: "#00796B",
          tertiaryEmotions: [
            { name: "Inadequate", color: "#00695C" },
            { name: "Inferior", color: "#004D40" }
          ]
        },
        {
          name: "Threatened",
          color: "#004D40",
          tertiaryEmotions: [
            { name: "Nervous", color: "#004D40" },
            { name: "Exposed", color: "#004D40" }
          ]
        }
      ]
    },
    {
      name: "Angry",
      color: "#EF5350",
      angle: 225,
      secondaryEmotions: [
        {
          name: "Let down",
          color: "#EF9A9A",
          tertiaryEmotions: [
            { name: "Betrayed", color: "#FFCDD2" },
            { name: "Resentful", color: "#EF9A9A" }
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
            { name: "Indignant", color: "#E53935" },
            { name: "Violated", color: "#D32F2F" }
          ]
        },
        {
          name: "Mad",
          color: "#D32F2F",
          tertiaryEmotions: [
            { name: "Furious", color: "#C62828" },
            { name: "Jealous", color: "#B71C1C" }
          ]
        },
        {
          name: "Aggressive",
          color: "#C62828",
          tertiaryEmotions: [
            { name: "Provoked", color: "#B71C1C" },
            { name: "Hostile", color: "#B71C1C" }
          ]
        },
        {
          name: "Frustrated",
          color: "#B71C1C",
          tertiaryEmotions: [
            { name: "Infuriated", color: "#C62828" },
            { name: "Annoyed", color: "#D32F2F" }
          ]
        },
        {
          name: "Distant",
          color: "#D32F2F",
          tertiaryEmotions: [
            { name: "Withdrawn", color: "#E53935" },
            { name: "Numb", color: "#F44336" }
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
        },
        {
          name: "Disappointed",
          color: "#4CAF50",
          tertiaryEmotions: [
            { name: "Appalled", color: "#43A047" },
            { name: "Revolted", color: "#388E3C" }
          ]
        },
        {
          name: "Awful",
          color: "#388E3C",
          tertiaryEmotions: [
            { name: "Nauseated", color: "#2E7D32" },
            { name: "Detestable", color: "#1B5E20" }
          ]
        },
        {
          name: "Repelled",
          color: "#1B5E20",
          tertiaryEmotions: [
            { name: "Horrified", color: "#1B5E20" },
            { name: "Hesitant", color: "#1B5E20" }
          ]
        }
      ]
    }
  ];

  // Map of emotion names to colors for quick lookup
  const emotionColorMap = new Map<string, string>();

  useEffect(() => {
    // Build the emotion color map
    emotionWheel.forEach(primary => {
      emotionColorMap.set(primary.name.toLowerCase(), primary.color);
      primary.secondaryEmotions.forEach(secondary => {
        emotionColorMap.set(secondary.name.toLowerCase(), secondary.color);
        secondary.tertiaryEmotions.forEach(tertiary => {
          emotionColorMap.set(tertiary.name.toLowerCase(), tertiary.color);
        });
      });
    });
  }, []);

  // Find the matching emotion in the wheel structure
  const [processingEmotion, setProcessingEmotion] = useState<string | null>(null);

  useEffect(() => {
    // Reset animation stage when emotion changes
    setAnimationStage(0);
    setActivePrimary(null);
    setActiveSecondary(null);
    setActiveTertiary(null);
    
    // When processing starts, set a sequence of emotions being checked
    if (isProcessing) {
      const emotionSequence = ["joy", "love", "anger", "sadness", "fear", "surprise"];
      let currentIndex = 0;
      
      const interval = setInterval(() => {
        setProcessingEmotion(emotionSequence[currentIndex]);
        currentIndex = (currentIndex + 1) % emotionSequence.length;
      }, 800);
      
      return () => {
        clearInterval(interval);
        setProcessingEmotion(null);
      };
    }
    
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

  // Initialize 3D visualization
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Generate neural network nodes
    const generateNodes = () => {
      const nodes: {x: number, y: number, z: number, color: string, size?: number}[] = [];
      const numPrimaryNodes = emotionWheel.length;

      // Primary nodes in center
      emotionWheel.forEach((primary, i) => {
        const angle = (i * Math.PI * 2) / numPrimaryNodes;
        const radius = 50;
        nodes.push({
          x: Math.cos(angle) * radius + canvas.width / 2,
          y: Math.sin(angle) * radius + canvas.height / 2,
          z: 20,
          color: primary.color,
          size: 6
        });
      });

      // Secondary nodes in middle layer
      let secondaryCount = 0;
      emotionWheel.forEach((primary, i) => {
        primary.secondaryEmotions.forEach((secondary, j) => {
          const angle = (i * Math.PI * 2) / numPrimaryNodes + (j * Math.PI * 0.25) / primary.secondaryEmotions.length;
          const radius = 120;
          nodes.push({
            x: Math.cos(angle) * radius + canvas.width / 2,
            y: Math.sin(angle) * radius + canvas.height / 2,
            z: 10,
            color: secondary.color,
            size: 4
          });
          secondaryCount++;
        });
      });

      // Tertiary nodes in outer layer
      emotionWheel.forEach((primary, i) => {
        primary.secondaryEmotions.forEach((secondary, j) => {
          secondary.tertiaryEmotions.forEach((tertiary, k) => {
            const baseAngle = (i * Math.PI * 2) / numPrimaryNodes;
            const offset = (j * 0.3) + (k * 0.1);
            const angle = baseAngle + offset;
            const radius = 200;
            nodes.push({
              x: Math.cos(angle) * radius + canvas.width / 2,
              y: Math.sin(angle) * radius + canvas.height / 2,
              z: 5,
              color: tertiary.color,
              size: 2
            });
          });
        });
      });

      return nodes;
    };

    // Generate node connections
    const generateConnections = () => {
      const connections: {source: number, target: number, active: boolean}[] = [];
      const primaryCount = emotionWheel.length;
      let secondaryBaseIndex = primaryCount;

      // Connect primary to secondary
      emotionWheel.forEach((primary, i) => {
        primary.secondaryEmotions.forEach((_, j) => {
          connections.push({
            source: i,
            target: secondaryBaseIndex + j,
            active: false
          });
        });
        secondaryBaseIndex += primary.secondaryEmotions.length;
      });

      // Connect secondary to tertiary
      secondaryBaseIndex = primaryCount;
      let tertiaryBaseIndex = secondaryBaseIndex;

      emotionWheel.forEach(primary => {
        tertiaryBaseIndex += primary.secondaryEmotions.length;
      });

      let currentTertiaryIndex = tertiaryBaseIndex;

      emotionWheel.forEach(primary => {
        primary.secondaryEmotions.forEach((secondary, j) => {
          const secondaryIndex = secondaryBaseIndex + j;

          secondary.tertiaryEmotions.forEach((_, k) => {
            connections.push({
              source: secondaryIndex,
              target: currentTertiaryIndex + k,
              active: false
            });
          });

          currentTertiaryIndex += secondary.tertiaryEmotions.length;
        });

        secondaryBaseIndex += primary.secondaryEmotions.length;
      });

      return connections;
    };

    const nodes = generateNodes();
    const connections = generateConnections();

    setNeuronNodes(nodes);
    setConnections(connections);

    // Animation loop
    let time = 0;
    const animate = () => {
      if (!ctx || !canvas) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update nodes positions with gentle wave motion
      const updatedNodes = nodes.map((node, i) => {
        const speed = 0.001;
        const amplitude = 5;
        return {
          ...node,
          x: node.x + Math.sin(time * speed + i * 0.2) * amplitude,
          y: node.y + Math.cos(time * speed + i * 0.5) * amplitude
        };
      });

      // Draw connections with enhanced effects
      connections.forEach(conn => {
        const source = updatedNodes[conn.source];
        const target = updatedNodes[conn.target];

        // Calculate midpoint for curved lines
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2 + (Math.sin(time * 0.003) * 10);

        ctx.beginPath();

        // Use quadratic curves for more organic look
        ctx.moveTo(source.x, source.y);
        ctx.quadraticCurveTo(midX, midY, target.x, target.y);

        if (isProcessing) {
          // More dynamic lines during processing
          const pulseOpacity = Math.sin(time * 0.01 + conn.source * 0.1) * 0.4 + 0.6;
          const hue = (time * 0.1 + conn.source * 10) % 360;

          if (conn.active) {
            // Data flowing effect for active connections during processing
            const gradient = ctx.createLinearGradient(source.x, source.y, target.x, target.y);
            gradient.addColorStop(0, `rgba(0, 255, 255, ${pulseOpacity})`);
            gradient.addColorStop((Math.sin(time * 0.005 + conn.source * 0.1) * 0.5 + 0.5), `rgba(255, 100, 255, ${pulseOpacity})`);
            gradient.addColorStop(1, `rgba(100, 100, 255, ${pulseOpacity * 0.7})`);

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2.5;
          } else {
            ctx.strokeStyle = `hsla(${hue}, 80%, 70%, ${pulseOpacity * 0.2})`;
            ctx.lineWidth = 0.8;
          }
        } else {
          if (conn.active) {
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
            ctx.lineWidth = 2;
          } else {
            ctx.strokeStyle = 'rgba(100, 100, 255, 0.1)';
            ctx.lineWidth = 0.5;
          }
        }

        ctx.stroke();

        // Add data packet animation for active connections during processing
        if (isProcessing && conn.active) {
          const packetPos = (time * 0.01 + conn.source * 0.5) % 1;
          const packetX = source.x + (target.x - source.x) * packetPos;
          const packetY = source.y + (target.y - source.y) * packetPos;

          ctx.beginPath();
          ctx.arc(packetX, packetY, 3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fill();
        }
      });

      // Draw nodes with enhanced effects
      updatedNodes.forEach((node, i) => {
        ctx.beginPath();

        // Size adjustment based on processing state
        const nodeSize = isProcessing 
          ? (node.size || 1) * (1 + Math.sin(time * 0.005 + i * 0.2) * 0.3) 
          : (node.size || 1);

        ctx.arc(node.x, node.y, nodeSize * 3, 0, Math.PI * 2);

        // Create gradient fill for more dimension
        const gradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, nodeSize * 3
        );

        // More vibrant colors during processing
        if (isProcessing) {
          const alpha = 0.7 + Math.sin(time * 0.01 + i) * 0.3;
          gradient.addColorStop(0, node.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba'));
          gradient.addColorStop(0.7, node.color.replace(')', ', 0.6)').replace('rgb', 'rgba'));
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

          // Add glow effect for nodes during processing
          ctx.shadowColor = node.color;
          ctx.shadowBlur = 15;
        } else {
          gradient.addColorStop(0, node.color);
          gradient.addColorStop(0.7, node.color.replace(')', ', 0.6)').replace('rgb', 'rgba'));
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = gradient;
        ctx.fill();

        // Reset shadow for next drawing
        ctx.shadowBlur = 0;
      });

      // Add electric sparks during processing
      if (isProcessing && time % 10 === 0) {
        for (let i = 0; i < 3; i++) {
          const randomSourceIndex = Math.floor(Math.random() * nodes.length);
          const randomTargetIndex = Math.floor(Math.random() * nodes.length);

          if (randomSourceIndex !== randomTargetIndex) {
            const source = updatedNodes[randomSourceIndex];
            const target = updatedNodes[randomTargetIndex];

            // Draw lightning effect
            ctx.beginPath();
            ctx.moveTo(source.x, source.y);

            // Create jagged line for electricity effect
            const segments = 5;
            for (let j = 1; j < segments; j++) {
              const ratio = j / segments;
              const x = source.x + (target.x - source.x) * ratio;
              const y = source.y + (target.y - source.y) * ratio;
              const offset = Math.random() * 20 - 10;

              ctx.lineTo(x + offset, y + offset);
            }

            ctx.lineTo(target.x, target.y);
            ctx.strokeStyle = 'rgba(100, 220, 255, 0.7)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      time += 16;
      requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Cleanup function
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, [activePrimary, activeSecondary, activeTertiary, isProcessing]);

  // Helper function to check if a node is active
  const isNodeActive = (index: number) => {
    // Primary nodes
    if (index < emotionWheel.length) {
      return activePrimary && emotionWheel[index].name === activePrimary.name;
    }

    // Secondary nodes
    let secondaryCount = 0;
    let secondaryIndex = -1;
    let primaryIndex = -1;

    for (let i = 0; i < emotionWheel.length; i++) {
      const primary = emotionWheel[i];

      for (let j = 0; j < primary.secondaryEmotions.length; j++) {
        const secondary = primary.secondaryEmotions[j];
        secondaryCount++;

        if (secondaryCount + emotionWheel.length - 1 === index) {
          secondaryIndex = j;
          primaryIndex = i;
          break;
        }
      }

      if (secondaryIndex !== -1) break;
    }

    if (secondaryIndex !== -1 && primaryIndex !== -1) {
      return (
        activePrimary && 
        activeSecondary && 
        emotionWheel[primaryIndex].name === activePrimary.name && 
        emotionWheel[primaryIndex].secondaryEmotions[secondaryIndex].name === activeSecondary.name
      );
    }

    // Tertiary nodes
    return activeTertiary !== null && activePrimary !== null && activeSecondary !== null;
  };

  // Utility function to convert hex to rgb
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '0, 200, 255';
  };

  return (
    <div className="emotion-visualization-container">
      <canvas 
        ref={canvasRef} 
        className={`emotion-neural-net ${isProcessing ? 'processing' : ''}`}
      />

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

      {isProcessing && (
        <div className="processing-overlay">
          <div className="processing-spinner"></div>
          <div className="processing-text">Analyzing emotional patterns...</div>
          <div className="emotion-detection-status">
            <span className="pulse-dot"></span>
            <span>
              {processingEmotion 
                ? `Analyzing: ${processingEmotion}` 
                : "Identifying primary emotion..."}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmotionWheel;