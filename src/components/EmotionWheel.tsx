import React, { useEffect, useState, useRef, useCallback } from 'react';
import './EmotionWheel.css';

interface Tertiary {
  name: string;
  color: string;
}

interface Secondary {
  name: string;
  color: string;
  tertiaryEmotions: Tertiary[];
  parent?: string; // Added parent property
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

// Define node types for better performance
interface Node {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  type: 'primary' | 'secondary' | 'tertiary';
  data: any;
}

interface Connection {
  id: number;
  source: string;
  target: string;
  color: string;
  width: number;
}

const EmotionWheel: React.FC<EmotionWheelProps> = ({ 
  selectedEmotion, 
  wheelRotation, 
  isProcessing,
  processingStage 
}) => {
  const [activePrimary, setActivePrimary] = useState<Primary | null>(null);
  const [activeSecondary, setActiveSecondary] = useState<Secondary | null>(null);
  const [activeTertiary, setActiveTertiary] = useState<Tertiary | null>(null);
  const [animationStage, setAnimationStage] = useState<number>(0);
  const [nodes, setNodes] = useState<Node[]>([]); 
  const [connections, setConnections] = useState<Connection[]>([]);
  const [highlightedConnections, setHighlightedConnections] = useState<number[]>([]); 
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [mousePos, setMousePos] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [isInitialized, setIsInitialized] = useState(false);
  const [emotionsInitialized, setEmotionsInitialized] = useState(false);

  // Primary emotions
  const primaryEmotions: Primary[] = [
    { name: "Joy", color: "#FFD700", angle: 0, secondaryEmotions: [] },
    { name: "Love", color: "#FF1493", angle: 60, secondaryEmotions: [] },
    { name: "Fear", color: "#9370DB", angle: 120, secondaryEmotions: [] },
    { name: "Anger", color: "#FF4500", angle: 180, secondaryEmotions: [] },
    { name: "Sadness", color: "#4169E1", angle: 240, secondaryEmotions: [] },
    { name: "Surprise", color: "#00FFFF", angle: 300, secondaryEmotions: [] }
  ];

  // Secondary emotions
  const secondaryEmotions: Secondary[] = [
    { name: "Cheerful", color: "#FFF44F", tertiaryEmotions: [], parent: "Joy" },
    { name: "Peaceful", color: "#98FB98", tertiaryEmotions: [], parent: "Joy" },
    { name: "Affectionate", color: "#FF69B4", tertiaryEmotions: [], parent: "Love" },
    { name: "Romantic", color: "#C71585", tertiaryEmotions: [], parent: "Love" },
    { name: "Scared", color: "#BA55D3", tertiaryEmotions: [], parent: "Fear" },
    { name: "Anxious", color: "#9932CC", tertiaryEmotions: [], parent: "Fear" },
    { name: "Enraged", color: "#FF6347", tertiaryEmotions: [], parent: "Anger" },
    { name: "Annoyed", color: "#FFA07A", tertiaryEmotions: [], parent: "Anger" },
    { name: "Depressed", color: "#4682B4", tertiaryEmotions: [], parent: "Sadness" },
    { name: "Lonely", color: "#87CEEB", tertiaryEmotions: [], parent: "Sadness" },
    { name: "Amazed", color: "#40E0D0", tertiaryEmotions: [], parent: "Surprise" },
    { name: "Confused", color: "#48D1CC", tertiaryEmotions: [], parent: "Surprise" }
  ];

  // Tertiary emotions
  const tertiaryEmotions: Tertiary[] = [
    { name: "Happy", color: "#FFFF00" },
    { name: "Optimistic", color: "#F0E68C" },
    { name: "Content", color: "#98FB98" },
    { name: "Proud", color: "#7CFC00" },
    { name: "Accepted", color: "#00FF7F" },
    { name: "Validated", color: "#7FFFD4" },
    { name: "Enamored", color: "#FF69B4" },
    { name: "Trusted", color: "#FF1493" },
    { name: "Passionate", color: "#DB7093" },
    { name: "Tender", color: "#FFB6C1" },
    { name: "Terrified", color: "#8A2BE2" },
    { name: "Nervous", color: "#9370DB" },
    { name: "Rejected", color: "#DDA0DD" },
    { name: "Insecure", color: "#D8BFD8" },
    { name: "Hostile", color: "#FF4500" },
    { name: "Betrayed", color: "#FF6347" },
    { name: "Frustrated", color: "#FF7F50" },
    { name: "Distant", color: "#FFA07A" },
    { name: "Hurt", color: "#1E90FF" },
    { name: "Guilty", color: "#4169E1" },
    { name: "Disappointed", color: "#6495ED" },
    { name: "Hopeless", color: "#87CEEB" },
    { name: "Shocked", color: "#00FFFF" },
    { name: "Dismayed", color: "#40E0D0" },
    { name: "Excited", color: "#7FFFD4" },
    { name: "Confused", color: "#AFEEEE" }
  ];

  // Initialize emotion hierarchy only once
  useEffect(() => {
    if (!emotionsInitialized) {
      // Connect secondary to primary emotions
      secondaryEmotions.forEach(secondary => {
        const parent = primaryEmotions.find(p => p.name === secondary.parent);
        if (parent) {
          parent.secondaryEmotions.push(secondary);
        }
      });

      // Assign tertiary emotions to secondary randomly
      const tertiaryPerSecondary = Math.ceil(tertiaryEmotions.length / secondaryEmotions.length);
      let tertiaryIndex = 0;

      secondaryEmotions.forEach(secondary => {
        for (let i = 0; i < tertiaryPerSecondary && tertiaryIndex < tertiaryEmotions.length; i++) {
          secondary.tertiaryEmotions.push(tertiaryEmotions[tertiaryIndex]);
          tertiaryIndex++;
        }
      });

      setEmotionsInitialized(true);
    }
  }, [emotionsInitialized]);

  // Find an emotion in the lists by name (case-insensitive)
  const findEmotion = (name: string | null, emotionList: any[]): any | null => {
    if (!name) return null;
    const normalizedName = name.toLowerCase();
    return emotionList.find(emotion => emotion.name.toLowerCase() === normalizedName) || null;
  };

  // Update active emotions when selected emotion changes
  useEffect(() => {
    if (!selectedEmotion || !emotionsInitialized) return;

    // Find the emotion in tertiary list first (most specific)
    const tertiary = findEmotion(selectedEmotion, tertiaryEmotions);
    if (tertiary) {
      // Find which secondary contains this tertiary
      const secondary = secondaryEmotions.find(sec => 
        sec.tertiaryEmotions.some(ter => ter.name === tertiary.name)
      );
      if (secondary) {
        // Find which primary contains this secondary
        const primary = primaryEmotions.find(pri => 
          pri.secondaryEmotions.some(sec => sec.name === secondary.name)
        );
        setActiveTertiary(tertiary);
        setActiveSecondary(secondary);
        setActivePrimary(primary || null);
        setAnimationStage(3);
      }
    } else {
      // Try secondary level
      const secondary = findEmotion(selectedEmotion, secondaryEmotions);
      if (secondary) {
        const primary = primaryEmotions.find(pri => 
          pri.secondaryEmotions.some(sec => sec.name === secondary.name)
        );
        setActiveSecondary(secondary);
        setActivePrimary(primary || null);
        setActiveTertiary(null);
        setAnimationStage(2);
      } else {
        // Try primary level
        const primary = findEmotion(selectedEmotion, primaryEmotions);
        setActivePrimary(primary || null);
        setActiveSecondary(null);
        setActiveTertiary(null);
        setAnimationStage(primary ? 1 : 0);
      }
    }
  }, [selectedEmotion, emotionsInitialized]);

  // Initialize nodes
  useEffect(() => {
    if (isInitialized || !emotionsInitialized) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Create initial nodes with positions
    const initialNodes: Node[] = [
      // Primary emotions (inner circle)
      ...primaryEmotions.map((emotion, i) => {
        const angle = (i * 2 * Math.PI) / primaryEmotions.length;
        const radius = 80;
        return {
          id: emotion.name,
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
          radius: 15,
          color: emotion.color,
          type: 'primary',
          data: emotion
        };
      }),

      // Secondary emotions (middle circle)
      ...secondaryEmotions.map((emotion, i) => {
        const angle = (i * 2 * Math.PI) / secondaryEmotions.length;
        const radius = 140;
        return {
          id: emotion.name,
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
          radius: 12,
          color: emotion.color,
          type: 'secondary',
          data: emotion
        };
      }),

      // Tertiary emotions (outer circle)
      ...tertiaryEmotions.map((emotion, i) => {
        const angle = (i * 2 * Math.PI) / tertiaryEmotions.length;
        const radius = 200;
        return {
          id: emotion.name,
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
          radius: 8,
          color: emotion.color,
          type: 'tertiary',
          data: emotion
        };
      })
    ];

    // Create connections
    const initialConnections: Connection[] = [];
    let connectionId = 0;

    // Connect primary to their secondaries
    primaryEmotions.forEach(primary => {
      const primaryNode = initialNodes.find(node => node.id === primary.name);

      primary.secondaryEmotions.forEach(secondary => {
        const secondaryNode = initialNodes.find(node => node.id === secondary.name);

        if (primaryNode && secondaryNode) {
          initialConnections.push({
            id: connectionId++,
            source: primary.name,
            target: secondary.name,
            color: `rgba(${parseInt(primary.color.slice(1, 3), 16)}, ${parseInt(primary.color.slice(3, 5), 16)}, ${parseInt(primary.color.slice(5, 7), 16)}, 0.6)`,
            width: 3
          });
        }
      });
    });

    // Connect secondaries to their tertiaries
    secondaryEmotions.forEach(secondary => {
      const secondaryNode = initialNodes.find(node => node.id === secondary.name);

      secondary.tertiaryEmotions.forEach(tertiary => {
        const tertiaryNode = initialNodes.find(node => node.id === tertiary.name);

        if (secondaryNode && tertiaryNode) {
          initialConnections.push({
            id: connectionId++,
            source: secondary.name,
            target: tertiary.name,
            color: `rgba(${parseInt(secondary.color.slice(1, 3), 16)}, ${parseInt(secondary.color.slice(3, 5), 16)}, ${parseInt(secondary.color.slice(5, 7), 16)}, 0.5)`,
            width: 2
          });
        }
      });
    });

    setNodes(initialNodes);
    setConnections(initialConnections);
    setIsInitialized(true);
  }, [emotionsInitialized, isInitialized]);

  // Handle hover to find node
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || nodes.length === 0) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({x: e.clientX, y: e.clientY});

    // Find hovered node
    const hovered = nodes.find(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= node.radius;
    });

    // If we hover a node, highlight its connections
    if (hovered) {
      const relatedConnectionIds = connections
        .filter(conn => conn.source === hovered.id || conn.target === hovered.id)
        .map(conn => conn.id);

      setHighlightedConnections(relatedConnectionIds);
    } else {
      setHighlightedConnections([]);
    }

    setHoveredNode(hovered || null);
  }, [nodes, connections]);

  // Draw function - optimized for performance
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all connections with reduced opacity
    connections.forEach(connection => {
      const sourceNode = nodes.find(node => node.id === connection.source);
      const targetNode = nodes.find(node => node.id === connection.target);

      if (sourceNode && targetNode) {
        ctx.beginPath();
        ctx.strokeStyle = connection.color;
        ctx.lineWidth = connection.width;
        ctx.globalAlpha = 0.4;

        // If this connection is highlighted (node is hovered), make it brighter
        if (highlightedConnections.includes(connection.id)) {
          ctx.globalAlpha = 0.9;
          ctx.lineWidth = connection.width + 1;
        }

        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      ctx.beginPath();

      // Base color
      ctx.fillStyle = node.color;

      // If this is the selected emotion, make it glow
      if ((activePrimary && node.id === activePrimary.name) ||
          (activeSecondary && node.id === activeSecondary.name) ||
          (activeTertiary && node.id === activeTertiary.name)) {
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 15;
      } else {
        ctx.shadowBlur = 0;
      }

      // If hovered, make it slightly larger
      const radius = hoveredNode && hoveredNode.id === node.id ? node.radius * 1.2 : node.radius;

      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Add a white highlight dot
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.arc(node.x - radius * 0.3, node.y - radius * 0.3, radius * 0.3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Request next frame only if needed
    animationRef.current = requestAnimationFrame(draw);
  }, [nodes, connections, hoveredNode, highlightedConnections, activePrimary, activeSecondary, activeTertiary]);

  // Set up canvas and start animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions based on container size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Start the drawing loop
    animationRef.current = requestAnimationFrame(draw);

    // Clean up animation frame on unmount
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [draw]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      // Recalculate node positions
      if (nodes.length > 0) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        setNodes(prev => prev.map(node => {
          // Calculate angle from center to current position
          const dx = node.x - centerX;
          const dy = node.y - centerY;
          const angle = Math.atan2(dy, dx);

          // Maintain the same distance from center
          const distance = Math.sqrt(dx * dx + dy * dy);

          return {
            ...node,
            x: centerX + distance * Math.cos(angle),
            y: centerY + distance * Math.sin(angle)
          };
        }));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [nodes]);

  const getEmoji = (emotion: string): string => {
    //  A very basic emoji mapping - replace with a more comprehensive solution
    switch (emotion.toLowerCase()) {
      case "happy": return "😊";
      case "sad": return "😔";
      case "angry": return "😠";
      case "fearful": return "😨";
      case "surprised": return "😲";
      case "disgusted": return "🤢";
      case "optimistic": return "😄";
      case "trusting": return "😇";
      case "proud": return "👍";
      case "content": return "😌";
      case "playful": return "😜";
      case "interested": return "🤔";
      case "accepted": return "🤝";
      case "peaceful": return "☮️";
      case "amazed": return "🤯";
      case "confused": return "😕";
      case "excited": return "🥳";
      case "startled": return "😱";
      case "lonely": return "💔";
      case "vulnerable": return "🥺";
      case "guilty": return "😞";
      case "depressed": return "🙁";
      case "hurt": return "😢";
      case "bored": return "😴";
      case "busy": return "🏃";
      case "stressed": return "😫";
      case "tired": return "😪";
      case "scared": return "😱";
      case "anxious": return "😰";
      case "weak": return "😥";
      case "rejected": return "💔";
      case "threatened": return "⚠️";
      case "let down": return "😓";
      case "humiliated": return "😞";
      case "bitter": return "😠";
      case "mad": return "😡";
      case "aggressive": return "👿";
      case "frustrated": return "💢";
      case "distant": return "😶";
      case "critical": return "🤨";
      case "disapproving": return "👎";
      case "disappointed": return "😔";
      case "awful": return "🤮";
      case "repelled": return "😖";
      case "joy": return "😄";
      case "love": return "❤️";
      case "fear": return "😨";
      case "anger": return "😠";
      case "sadness": return "😢";
      case "surprise": return "😲";
      case "cheerful": return "😊";
      case "romantic": return "💕";
      case "enraged": return "😡";
      case "annoyed": return "😒";
      case "shocked": return "😱";
      case "dismayed": return "😟";
      case "affectionate": return "🥰";
      case "passionate": return "❤️‍🔥";
      case "tender": return "☺️";
      default: return "🔍";
    }
  };

  return (
    <div className="emotion-visualization-container" >
      <canvas 
        ref={canvasRef} 
        className={`emotion-neural-net ${isProcessing ? 'processing' : ''}`}
        onMouseMove={handleMouseMove}
      />
      {hoveredNode && (
        <div 
          className="emotion-tooltip" 
          style={{
            opacity: 1,
            visibility: 'visible',
            left: `${mousePos.x + 10}px`,
            top: `${mousePos.y + 10}px`
          }}
        >
          <span className="emotion-emoji">{getEmoji(hoveredNode.id)}</span>
          <span>{hoveredNode.id}</span>
        </div>
      )}
      {selectedEmotion && (
        <div className="emotion-path-container">
          <div className={`emotion-path ${animationStage > 0 ? 'show' : ''}`}>
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
      )}

      {isProcessing && (
        <div className="processing-overlay">
          <div className="processing-spinner"></div>
          <div className="processing-text">{processingStage}</div>
        </div>
      )}
    </div>
  );
};

export default EmotionWheel;