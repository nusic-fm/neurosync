import React, { useEffect, useState, useRef } from 'react';
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

interface Node {
  x: number;
  y: number;
  z: number;
  color: string;
  radius?: number;
  type: 'primary' | 'secondary' | 'tertiary';
  name: string;
  index: number;
  id: string; // Changed id property to string
  data?: Primary | Secondary | Tertiary; // Added data property
}

type Connection = { source: number, target: number, active: boolean };

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
  const [nodes, setNodes] = useState<Node[]>([]); // Renamed neuronNodes to nodes
  const [connections, setConnections] = useState<Connection[]>([]);
  const [highlightedConnections, setHighlightedConnections] = useState<number[]>([]); 
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [mousePos, setMousePos] = useState<{x: number, y: number}>({x: 0, y: 0});


  const primaryEmotions: Primary[] = [
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
          ],
          parent: "Happy"
        },
        {
          name: "Trusting",
          color: "#FFE082",
          tertiaryEmotions: [
            { name: "Sensitive", color: "#FFECB3" },
            { name: "Intimate", color: "#FFD54F" }
          ],
          parent: "Happy"
        },
        {
          name: "Proud",
          color: "#FFCA28",
          tertiaryEmotions: [
            { name: "Confident", color: "#FFD54F" },
            { name: "Successful", color: "#FFC107" }
          ],
          parent: "Happy"
        },
        {
          name: "Content",
          color: "#FFC107",
          tertiaryEmotions: [
            { name: "Free", color: "#FFCA28" },
            { name: "Joyful", color: "#FFB300" }
          ],
          parent: "Happy"
        },
        {
          name: "Playful",
          color: "#FFB300",
          tertiaryEmotions: [
            { name: "Cheeky", color: "#FFA000" },
            { name: "Aroused", color: "#FF8F00" }
          ],
          parent: "Happy"
        },
        {
          name: "Interested",
          color: "#FF8F00",
          tertiaryEmotions: [
            { name: "Curious", color: "#FF9800" },
            { name: "Inquisitive", color: "#F57C00" }
          ],
          parent: "Happy"
        },
        {
          name: "Accepted",
          color: "#F57C00",
          tertiaryEmotions: [
            { name: "Respected", color: "#FB8C00" },
            { name: "Valued", color: "#EF6C00" }
          ],
          parent: "Happy"
        },
        {
          name: "Peaceful",
          color: "#EF6C00",
          tertiaryEmotions: [
            { name: "Thankful", color: "#F57F17" },
            { name: "Loving", color: "#FF6F00" }
          ],
          parent: "Happy"
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
          ],
          parent: "Surprised"
        },
        {
          name: "Confused",
          color: "#42A5F5",
          tertiaryEmotions: [
            { name: "Eager", color: "#2196F3" },
            { name: "Energetic", color: "#1E88E5" }
          ],
          parent: "Surprised"
        },
        {
          name: "Excited",
          color: "#1E88E5",
          tertiaryEmotions: [
            { name: "Overjoyed", color: "#1976D2" },
            { name: "Enthusiastic", color: "#1565C0" }
          ],
          parent: "Surprised"
        },
        {
          name: "Startled",
          color: "#1565C0",
          tertiaryEmotions: [
            { name: "Shocked", color: "#0D47A1" },
            { name: "Dismayed", color: "#0D47A1" }
          ],
          parent: "Surprised"
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
          ],
          parent: "Sad"
        },
        {
          name: "Vulnerable",
          color: "#90A4AE",
          tertiaryEmotions: [
            { name: "Fragile", color: "#78909C" },
            { name: "Grief", color: "#607D8B" }
          ],
          parent: "Sad"
        },
        {
          name: "Guilty",
          color: "#607D8B",
          tertiaryEmotions: [
            { name: "Ashamed", color: "#546E7A" },
            { name: "Remorseful", color: "#455A64" }
          ],
          parent: "Sad"
        },
        {
          name: "Depressed",
          color: "#455A64",
          tertiaryEmotions: [
            { name: "Empty", color: "#37474F" },
            { name: "Inferior", color: "#37474F" }
          ],
          parent: "Sad"
        },
        {
          name: "Hurt",
          color: "#37474F",
          tertiaryEmotions: [
            { name: "Disappointed", color: "#263238" },
            { name: "Embarrassed", color: "#263238" }
          ],
          parent: "Sad"
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
          ],
          parent: "Bad"
        },
        {
          name: "Busy",
          color: "#9575CD",
          tertiaryEmotions: [
            { name: "Rushed", color: "#7E57C2" },
            { name: "Pressured", color: "#673AB7" }
          ],
          parent: "Bad"
        },
        {
          name: "Stressed",
          color: "#673AB7",
          tertiaryEmotions: [
            { name: "Overwhelmed", color: "#5E35B1" },
            { name: "Out of control", color: "#512DA8" }
          ],
          parent: "Bad"
        },
        {
          name: "Tired",
          color: "#512DA8",
          tertiaryEmotions: [
            { name: "Sleepy", color: "#4527A0" },
            { name: "Unfocused", color: "#311B92" }
          ],
          parent: "Bad"
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
          ],
          parent: "Fearful"
        },
        {
          name: "Anxious",
          color: "#4DB6AC",
          tertiaryEmotions: [
            { name: "Worried", color: "#26A69A" },
            { name: "Insecure", color: "#009688" }
          ],
          parent: "Fearful"
        },
        {
          name: "Weak",
          color: "#009688",
          tertiaryEmotions: [
            { name: "Worthless", color: "#00897B" },
            { name: "Insignificant", color: "#00796B" }
          ],
          parent: "Fearful"
        },
        {
          name: "Rejected",
          color: "#00796B",
          tertiaryEmotions: [
            { name: "Inadequate", color: "#00695C" },
            { name: "Inferior", color: "#004D40" }
          ],
          parent: "Fearful"
        },
        {
          name: "Threatened",
          color: "#004D40",
          tertiaryEmotions: [
            { name: "Nervous", color: "#004D40" },
            { name: "Exposed", color: "#004D40" }
          ],
          parent: "Fearful"
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
          ],
          parent: "Angry"
        },
        {
          name: "Humiliated",
          color: "#E57373",
          tertiaryEmotions: [
            { name: "Disrespected", color: "#EF5350" },
            { name: "Ridiculed", color: "#F44336" }
          ],
          parent: "Angry"
        },
        {
          name: "Bitter",
          color: "#F44336",
          tertiaryEmotions: [
            { name: "Indignant", color: "#E53935" },
            { name: "Violated", color: "#D32F2F" }
          ],
          parent: "Angry"
        },
        {
          name: "Mad",
          color: "#D32F2F",
          tertiaryEmotions: [
            { name: "Furious", color: "#C62828" },
            { name: "Jealous", color: "#B71C1C" }
          ],
          parent: "Angry"
        },
        {
          name: "Aggressive",
          color: "#C62828",
          tertiaryEmotions: [
            { name: "Provoked", color: "#B71C1C" },
            { name: "Hostile", color: "#B71C1C" }
          ],
          parent: "Angry"
        },
        {
          name: "Frustrated",
          color: "#B71C1C",
          tertiaryEmotions: [
            { name: "Infuriated", color: "#C62828" },
            { name: "Annoyed", color: "#D32F2F" }
          ],
          parent: "Angry"
        },
        {
          name: "Distant",
          color: "#D32F2F",
          tertiaryEmotions: [
            { name: "Withdrawn", color: "#E53935" },
            { name: "Numb", color: "#F44336" }
          ],
          parent: "Angry"
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
          ],
          parent: "Disgusted"
        },
        {
          name: "Disapproving",
          color: "#81C784",
          tertiaryEmotions: [
            { name: "Judgmental", color: "#66BB6A" },
            { name: "Embarrassed", color: "#4CAF50" }
          ],
          parent: "Disgusted"
        },
        {
          name: "Disappointed",
          color: "#4CAF50",
          tertiaryEmotions: [
            { name: "Appalled", color: "#43A047" },
            { name: "Revolted", color: "#388E3C" }
          ],
          parent: "Disgusted"
        },
        {
          name: "Awful",
          color: "#388E3C",
          tertiaryEmotions: [
            { name: "Nauseated", color: "#2E7D32" },
            { name: "Detestable", color: "#1B5E20" }
          ],
          parent: "Disgusted"
        },
        {
          name: "Repelled",
          color: "#1B5E20",
          tertiaryEmotions: [
            { name: "Horrified", color: "#1B5E20" },
            { name: "Hesitant", color: "#1B5E20" }
          ],
          parent: "Disgusted"
        }
      ]
    }
  ];

  const secondaryEmotions = primaryEmotions.flatMap(primary => primary.secondaryEmotions);
  const tertiaryEmotions = secondaryEmotions.flatMap(secondary => secondary.tertiaryEmotions);

  useEffect(() => {
    setAnimationStage(0);
    setActivePrimary(null);
    setActiveSecondary(null);
    setActiveTertiary(null);

    if (!selectedEmotion) return;

    const findEmotion = (emotionName: string, emotionList: (Primary | Secondary | Tertiary)[]): (Primary | Secondary | Tertiary) | null => {
      return emotionList.find(emotion => emotion.name.toLowerCase() === emotionName.toLowerCase());
    }

    let foundEmotion = findEmotion(selectedEmotion, tertiaryEmotions);
    if (foundEmotion) {
        setActiveTertiary(foundEmotion as Tertiary);
        setActiveSecondary(secondaryEmotions.find(sec => sec.tertiaryEmotions.includes(foundEmotion as Tertiary)));
        setActivePrimary(primaryEmotions.find(pri => pri.secondaryEmotions.includes(setActiveSecondary as Secondary)));
        setAnimationStage(3);
    } else {
        foundEmotion = findEmotion(selectedEmotion, secondaryEmotions);
        if (foundEmotion) {
            setActiveSecondary(foundEmotion as Secondary);
            setActivePrimary(primaryEmotions.find(pri => pri.secondaryEmotions.includes(foundEmotion as Secondary)));
            setAnimationStage(2);
        } else {
            foundEmotion = findEmotion(selectedEmotion, primaryEmotions);
            if (foundEmotion) {
                setActivePrimary(foundEmotion as Primary);
                setAnimationStage(1);
            }
        }
    }
  }, [selectedEmotion, wheelRotation]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Create emotion wheel nodes - only calculate once
    if (nodes.length === 0) {
      const newNodes = [
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
      setNodes(newNodes);
    }
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const generateConnections = () => {
      const connections: Connection[] = [];
      const primaryCount = primaryEmotions.length;
      let secondaryBaseIndex = primaryCount;

      primaryEmotions.forEach((primary, i) => {
        primary.secondaryEmotions.forEach((_, j) => {
          connections.push({ source: i, target: secondaryBaseIndex + j, active: false });
        });
        secondaryBaseIndex += primary.secondaryEmotions.length;
      });

      secondaryBaseIndex = primaryCount;
      let tertiaryBaseIndex = secondaryBaseIndex;
      primaryEmotions.forEach(primary => tertiaryBaseIndex += primary.secondaryEmotions.length);
      let currentTertiaryIndex = tertiaryBaseIndex;

      primaryEmotions.forEach(primary => {
        primary.secondaryEmotions.forEach((secondary, j) => {
          const secondaryIndex = secondaryBaseIndex + j;
          secondary.tertiaryEmotions.forEach((_, k) => {
            connections.push({ source: secondaryIndex, target: currentTertiaryIndex + k, active: false });
          });
          currentTertiaryIndex += secondary.tertiaryEmotions.length;
        });
        secondaryBaseIndex += primary.secondaryEmotions.length;
      });

      return connections;
    };

    const cons = generateConnections();
    setConnections(cons);

    let time = 0;
    let animationFrameId: number;
    // Throttle frame rate for performance
    const frameSkip = 2; // Only render every 2nd frame
    let frameCount = 0;

    const animate = () => {
      if (!ctx || !canvas) return;

      frameCount++;
      if (frameCount % frameSkip !== 0) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const hasActiveHover = hoveredNode !== null;

      nodes.forEach(node => {
        if (node.type === 'secondary' && node.data && (node.data as Secondary).parent) {
          const parentNode = nodes.find(n => n.id === (node.data as Secondary).parent);
          if (parentNode) {
            const isInActivePath = 
              (activePrimary && (node.id === activePrimary.name || parentNode.id === activePrimary.name)) ||
              (activeSecondary && (node.id === activeSecondary.name || parentNode.id === activeSecondary.name));
            const isHovered = (hoveredNode && (node.id === hoveredNode.id || parentNode.id === hoveredNode.id));
            const opacity = isInActivePath || isHovered ? 0.5 : 0.1;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(parentNode.x, parentNode.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.lineWidth = isInActivePath || isHovered ? 1.5 : 1;
            ctx.stroke();
          }
        }

        if (node.type === 'tertiary' && node.data && (node.data as Tertiary).name) {
          const parentNode = nodes.find(n => n.id === (nodes.find(n => n.data && (n.data as Secondary).tertiaryEmotions.find(t => t.name === (node.data as Tertiary).name))?.id));
          if (parentNode) {
            const isInActivePath = 
              (activeSecondary && (node.id === activeSecondary.name || parentNode.id === activeSecondary.name)) ||
              (activeTertiary && (node.id === activeTertiary.name || parentNode.id === activeTertiary.name));
            const isHovered = (hoveredNode && (node.id === hoveredNode.id || parentNode.id === hoveredNode.id));
            const opacity = isInActivePath || isHovered ? 0.5 : 0.1;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(parentNode.x, parentNode.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.lineWidth = isInActivePath || isHovered ? 1.5 : 1;
            ctx.stroke();
          }
        }
      });


      if (isProcessing && time % 20 === 0) {
        for (let i = 0; i < 2; i++) {
          const randomSourceIndex = Math.floor(Math.random() * nodes.length);
          const randomTargetIndex = Math.floor(Math.random() * nodes.length);

          if (randomSourceIndex !== randomTargetIndex) {
            const source = nodes[randomSourceIndex];
            const target = nodes[randomTargetIndex];

            ctx.beginPath();
            ctx.moveTo(source.x, source.y);

            const segments = 3;
            for (let j = 1; j < segments; j++) {
              const ratio = j / segments;
              const x = source.x + (target.x - source.x) * ratio;
              const y = source.y + (target.y - source.y) * ratio;
              const offset = Math.random() * 15 - 7.5; 

              ctx.lineTo(x + offset, y + offset);
            }

            ctx.lineTo(target.x, target.y);
            ctx.strokeStyle = 'rgba(100, 220, 255, 0.7)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      nodes.forEach(node => {
        let radius = node.radius || 10;
        let opacity = 0.6;
        let glowSize = 0;

        const isSelected = selectedEmotion && node.id.toLowerCase() === selectedEmotion.toLowerCase();
        if (isSelected) {
          const pulse = 1 + 0.15 * Math.sin((time/5) * 0.05);
          radius *= pulse;
          opacity = 0.8;
          glowSize = 8 * pulse;
        }

        if (hoveredNode && node.id === hoveredNode.id) {
          radius *= 1.2;
          opacity = 1;
          glowSize = 12;
        }

        if (
          (activePrimary && node.id === activePrimary.name) ||
          (activeSecondary && node.id === activeSecondary.name) ||
          (activeTertiary && node.id === activeTertiary.name)
        ) {
          radius *= 1.2;
          opacity = 1;
          glowSize = 10;
        }

        if (glowSize > 0) {
          const gradient = ctx.createRadialGradient(
            node.x, node.y, radius,
            node.x, node.y, radius + glowSize
          );
          gradient.addColorStop(0, `${node.color}ff`);
          gradient.addColorStop(1, `${node.color}00`);

          ctx.beginPath();
          ctx.arc(node.x, node.y, radius + glowSize, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `${node.color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();

        if (opacity > 0.7) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.7})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      time += 8;
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePos({x, y});
        const foundNode = nodes.find(node => {
          const distance = Math.sqrt(Math.pow(x - node.x, 2) + Math.pow(y - node.y, 2));
          return distance < (node.radius || 1) * 3;
        });
        setHoveredNode(foundNode);

        if (foundNode) {
          const relatedConnections = connections.reduce((acc, conn, index) => {
            if (conn.source === nodes.findIndex(n => n.id === foundNode.id) || conn.target === nodes.findIndex(n => n.id === foundNode.id)) {
              acc.push(index);
            }
            return acc;
          }, [] as number[]);
          setHighlightedConnections(relatedConnections);
        } else {
          setHighlightedConnections([]);
        }
      }
    };

    // Use throttling to reduce the frequency of mouse move events
    const throttle = (func: Function, limit: number) => {
      let inThrottle: boolean = false;
      return function(this: any, ...args: any[]) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      }
    };

    const throttledHandleMouseMove = throttle(handleMouseMove, 30); // Throttle to run at most every 30ms
    canvas.addEventListener('mousemove', throttledHandleMouseMove);
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', throttledHandleMouseMove);
    };
  }, [activePrimary, activeSecondary, activeTertiary, isProcessing, nodes, connections, hoveredNode]);


  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '0, 200, 255';
  };

  const getEmoji = (emotion: string): string => {
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
      case "interested": return"🤔";
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
      default: return "";
    }
  };

  return (
    <div className="emotion-visualization-container" >
      <canvas 
        ref={canvasRef} 
        className={`emotion-neural-net ${isProcessing ? 'processing' : ''}`}
        onMouseMove={e => handleMouseMove(e)}
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
          <div className="processing-text">Analyzing emotional patterns...</div>
        </div>
      )}
    </div>
  );
};

export default EmotionWheel;