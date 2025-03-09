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

// Function to mock emotion analysis based on the CSV structure
export const mockEmotionAnalysis = (query: string): string => {
  const query_lower = query.toLowerCase();

  // Primary emotions
  if (query_lower.includes('happy') || query_lower.includes('joy') || query_lower.includes('content')) {
    // Secondary emotions - Happy family
    if (query_lower.includes('optimist') || query_lower.includes('hope')) {
      // Tertiary emotions - Optimistic
      if (query_lower.includes('inspire')) return 'Inspired';
      if (query_lower.includes('hope')) return 'Hopeful';
      return 'Optimistic';
    }
    if (query_lower.includes('trust')) {
      // Tertiary emotions - Trusting
      if (query_lower.includes('sensitive')) return 'Sensitive';
      if (query_lower.includes('intimate')) return 'Intimate';
      return 'Trusting';
    }
    if (query_lower.includes('proud') || query_lower.includes('confidence')) {
      // Tertiary emotions - Proud
      if (query_lower.includes('confident')) return 'Confident';
      if (query_lower.includes('success')) return 'Successful';
      return 'Proud';
    }
    if (query_lower.includes('content') || query_lower.includes('satisfy')) {
      // Tertiary emotions - Content
      if (query_lower.includes('free')) return 'Free';
      if (query_lower.includes('joy')) return 'Joyful';
      return 'Content';
    }
    if (query_lower.includes('play') || query_lower.includes('fun')) {
      // Tertiary emotions - Playful
      if (query_lower.includes('cheek')) return 'Cheeky';
      if (query_lower.includes('arous')) return 'Aroused';
      return 'Playful';
    }
    if (query_lower.includes('interest')) {
      // Tertiary emotions - Interested
      if (query_lower.includes('curious')) return 'Curious';
      if (query_lower.includes('inquisit')) return 'Inquisitive';
      return 'Interested';
    }
    if (query_lower.includes('accept')) {
      // Tertiary emotions - Accepted
      if (query_lower.includes('respect')) return 'Respected';
      if (query_lower.includes('value')) return 'Valued';
      return 'Accepted';
    }
    if (query_lower.includes('peace')) {
      // Tertiary emotions - Peaceful
      if (query_lower.includes('thank')) return 'Thankful';
      if (query_lower.includes('love')) return 'Loving';
      return 'Peaceful';
    }
    return 'Happy';
  }

  if (query_lower.includes('surprise')) {
    // Secondary emotions - Surprised family
    if (query_lower.includes('amaze') || query_lower.includes('awe')) {
      // Tertiary emotions - Amazed
      if (query_lower.includes('awe')) return 'Awed';
      if (query_lower.includes('astonish')) return 'Astonished';
      return 'Amazed';
    }
    if (query_lower.includes('confus')) {
      // Tertiary emotions - Confused
      if (query_lower.includes('eager')) return 'Eager';
      if (query_lower.includes('energy') || query_lower.includes('energetic')) return 'Energetic';
      return 'Confused';
    }
    if (query_lower.includes('excit')) {
      // Tertiary emotions - Excited
      if (query_lower.includes('overjoy')) return 'Overjoyed';
      if (query_lower.includes('enthusiast')) return 'Enthusiastic';
      return 'Excited';
    }
    if (query_lower.includes('startle')) {
      // Tertiary emotions - Startled
      if (query_lower.includes('shock')) return 'Shocked';
      if (query_lower.includes('dismay')) return 'Dismayed';
      return 'Startled';
    }
    return 'Surprised';
  }

  if (query_lower.includes('sad')) {
    // Secondary emotions - Sad family
    if (query_lower.includes('lonely') || query_lower.includes('alone')) {
      // Tertiary emotions - Lonely
      if (query_lower.includes('abandon')) return 'Abandoned';
      if (query_lower.includes('victim')) return 'Victimized';
      return 'Lonely';
    }
    if (query_lower.includes('vulnerab')) {
      // Tertiary emotions - Vulnerable
      if (query_lower.includes('fragile')) return 'Fragile';
      if (query_lower.includes('grief')) return 'Grief';
      return 'Vulnerable';
    }
    if (query_lower.includes('guilt')) {
      // Tertiary emotions - Guilty
      if (query_lower.includes('shame') || query_lower.includes('ashame')) return 'Ashamed';
      if (query_lower.includes('remorse')) return 'Remorseful';
      return 'Guilty';
    }
    if (query_lower.includes('depress')) {
      // Tertiary emotions - Depressed
      if (query_lower.includes('empty')) return 'Empty';
      if (query_lower.includes('inferior')) return 'Inferior';
      return 'Depressed';
    }
    if (query_lower.includes('hurt')) {
      // Tertiary emotions - Hurt
      if (query_lower.includes('disappoint')) return 'Disappointed';
      if (query_lower.includes('embarrass')) return 'Embarrassed';
      return 'Hurt';
    }
    return 'Sad';
  }

  if (query_lower.includes('bad')) {
    // Secondary emotions - Bad family
    if (query_lower.includes('bore')) {
      // Tertiary emotions - Bored
      if (query_lower.includes('indifferent')) return 'Indifferent';
      if (query_lower.includes('apathet')) return 'Apathetic';
      return 'Bored';
    }
    if (query_lower.includes('busy')) {
      // Tertiary emotions - Busy
      if (query_lower.includes('rush')) return 'Rushed';
      if (query_lower.includes('pressure')) return 'Pressured';
      return 'Busy';
    }
    if (query_lower.includes('stress')) {
      // Tertiary emotions - Stressed
      if (query_lower.includes('overwhelm')) return 'Overwhelmed';
      if (query_lower.includes('control')) return 'Out of control';
      return 'Stressed';
    }
    if (query_lower.includes('tire')) {
      // Tertiary emotions - Tired
      if (query_lower.includes('sleep')) return 'Sleepy';
      if (query_lower.includes('unfocus')) return 'Unfocused';
      return 'Tired';
    }
    return 'Bad';
  }

  if (query_lower.includes('fear') || query_lower.includes('afraid') || query_lower.includes('scared')) {
    // Secondary emotions - Fearful family
    if (query_lower.includes('scare')) {
      // Tertiary emotions - Scared
      if (query_lower.includes('helpless')) return 'Helpless';
      if (query_lower.includes('fright')) return 'Frightened';
      return 'Scared';
    }
    if (query_lower.includes('anxious') || query_lower.includes('anxiety')) {
      // Tertiary emotions - Anxious
      if (query_lower.includes('worry')) return 'Worried';
      if (query_lower.includes('insecure')) return 'Insecure';
      return 'Anxious';
    }
    if (query_lower.includes('weak')) {
      // Tertiary emotions - Weak
      if (query_lower.includes('worthless')) return 'Worthless';
      if (query_lower.includes('insignificant')) return 'Insignificant';
      return 'Weak';
    }
    if (query_lower.includes('reject')) {
      // Tertiary emotions - Rejected
      if (query_lower.includes('inadequate')) return 'Inadequate';
      if (query_lower.includes('inferior')) return 'Inferior';
      return 'Rejected';
    }
    if (query_lower.includes('threat')) {
      // Tertiary emotions - Threatened
      if (query_lower.includes('nervous')) return 'Nervous';
      if (query_lower.includes('exposed')) return 'Exposed';
      return 'Threatened';
    }
    return 'Fearful';
  }

  if (query_lower.includes('angry') || query_lower.includes('anger') || query_lower.includes('mad')) {
    // Secondary emotions - Angry family
    if (query_lower.includes('let down')) {
      // Tertiary emotions - Let down
      if (query_lower.includes('betray')) return 'Betrayed';
      if (query_lower.includes('resent')) return 'Resentful';
      return 'Let down';
    }
    if (query_lower.includes('humiliat')) {
      // Tertiary emotions - Humiliated
      if (query_lower.includes('disrespect')) return 'Disrespected';
      if (query_lower.includes('ridicul')) return 'Ridiculed';
      return 'Humiliated';
    }
    if (query_lower.includes('bitter')) {
      // Tertiary emotions - Bitter
      if (query_lower.includes('indignant')) return 'Indignant';
      if (query_lower.includes('violat')) return 'Violated';
      return 'Bitter';
    }
    if (query_lower.includes('mad')) {
      // Tertiary emotions - Mad
      if (query_lower.includes('furious')) return 'Furious';
      if (query_lower.includes('jealous')) return 'Jealous';
      return 'Mad';
    }
    if (query_lower.includes('aggress')) {
      // Tertiary emotions - Aggressive
      if (query_lower.includes('provok')) return 'Provoked';
      if (query_lower.includes('hostile')) return 'Hostile';
      return 'Aggressive';
    }
    if (query_lower.includes('frustrat')) {
      // Tertiary emotions - Frustrated
      if (query_lower.includes('infuriat')) return 'Infuriated';
      if (query_lower.includes('annoy')) return 'Annoyed';
      return 'Frustrated';
    }
    if (query_lower.includes('distant')) {
      // Tertiary emotions - Distant
      if (query_lower.includes('withdraw')) return 'Withdrawn';
      if (query_lower.includes('numb')) return 'Numb';
      return 'Distant';
    }
    return 'Angry';
  }

  if (query_lower.includes('disgust')) {
    // Secondary emotions - Disgusted family
    if (query_lower.includes('critic')) {
      // Tertiary emotions - Critical
      if (query_lower.includes('skeptic')) return 'Skeptical';
      if (query_lower.includes('dismiss')) return 'Dismissive';
      return 'Critical';
    }
    if (query_lower.includes('disapprov')) {
      // Tertiary emotions - Disapproving
      if (query_lower.includes('judgment')) return 'Judgmental';
      if (query_lower.includes('embarrass')) return 'Embarrassed';
      return 'Disapproving';
    }
    if (query_lower.includes('disappoint')) {
      // Tertiary emotions - Disappointed
      if (query_lower.includes('appall')) return 'Appalled';
      if (query_lower.includes('revolt')) return 'Revolted';
      return 'Disappointed';
    }
    if (query_lower.includes('awful')) {
      // Tertiary emotions - Awful
      if (query_lower.includes('nausea')) return 'Nauseated';
      if (query_lower.includes('detest')) return 'Detestable';
      return 'Awful';
    }
    if (query_lower.includes('repel')) {
      // Tertiary emotions - Repelled
      if (query_lower.includes('horrif')) return 'Horrified';
      if (query_lower.includes('hesit')) return 'Hesitant';
      return 'Repelled';
    }
    return 'Disgusted';
  }

  // Town lets roam special case
  if (query_lower.includes('town') && query_lower.includes('roam')) {
    return 'Happiness'; // Secondary emotion from Happy family
  }

  // If no clear emotion is detected, choose a random one
  const primaryEmotions = ['Happy', 'Surprised', 'Sad', 'Bad', 'Fearful', 'Angry', 'Disgusted'];
  return primaryEmotions[Math.floor(Math.random() * primaryEmotions.length)];
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