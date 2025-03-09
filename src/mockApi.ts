
// Mock API implementation for testing when real APIs are unavailable

// Sample emotions to cycle through for testing
const sampleEmotions = [
  'joy', 'happiness', 'serenity', 'ecstasy',
  'love', 'affection', 'romance', 'compassion', 
  'anger', 'annoyance', 'rage', 'disgust',
  'sadness', 'disappointment', 'grief', 'loneliness',
  'fear', 'anxiety', 'terror', 'insecurity',
  'surprise', 'amazement', 'shock', 'astonishment'
];

// Mock emotion analysis with basic text sentiment patterns
export const mockEmotionAnalysis = (text: string): string => {
  text = text.toLowerCase();
  
  // Simple pattern matching to determine emotion
  if (text.includes('happy') || text.includes('joy') || text.includes('party') || text.includes('fun')) {
    return 'joy';
  } else if (text.includes('love') || text.includes('like') || text.includes('care')) {
    return 'love';
  } else if (text.includes('angry') || text.includes('mad') || text.includes('hate')) {
    return 'anger';
  } else if (text.includes('sad') || text.includes('upset') || text.includes('lonely')) {
    return 'sadness';
  } else if (text.includes('afraid') || text.includes('scared') || text.includes('fear')) {
    return 'fear';
  } else if (text.includes('surprised') || text.includes('wow') || text.includes('amazing')) {
    return 'surprise';
  }
  
  // If no matches, return a random emotion
  return sampleEmotions[Math.floor(Math.random() * sampleEmotions.length)];
};

// Mock API health check function
export const mockApiHealth = async (): Promise<boolean> => {
  console.log("Running mock API health check");
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  // Always return true for mock API
  return true;
};

// Mock the emotion API
export const mockEmotionApi = async (query: string): Promise<{
  success: boolean;
  status?: number;
  data?: any;
  error?: string;
  parsedEmotion?: string;
  apiEndpoint?: string;
}> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    // Occasionally simulate errors (10% chance)
    if (Math.random() < 0.1) {
      throw new Error('Mock API random error');
    }
    
    const emotion = mockEmotionAnalysis(query);
    
    return {
      success: true,
      status: 200,
      data: `Summary: ${emotion}`,
      parsedEmotion: emotion,
      apiEndpoint: 'mock-api-endpoint'
    };
  } catch (error: any) {
    return {
      success: false,
      status: 500,
      error: `Mock API error: ${error.message}`
    };
  }
};

// Mock speech synthesis URL
export const mockSpeechSynthesis = async (text: string): Promise<string> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return one of several sample audio URLs based on the text content
  const audioSamples = [
    'https://audio-samples.github.io/samples/mp3/blizzard_promo.mp3',
    'https://audio-samples.github.io/samples/mp3/blizzard_bigsplash.mp3',
    'https://audio-samples.github.io/samples/mp3/blizzard_fibonaccismith.mp3',
    'https://audio-samples.github.io/samples/mp3/blizzard_chant1.mp3'
  ];
  
  // Pick a sample based on the first character of the text
  const sampleIndex = text.charCodeAt(0) % audioSamples.length;
  return audioSamples[sampleIndex];
};
