
// API utility functions

/**
 * Simple health check for the emotion API to determine if it's available
 */
export const checkEmotionApiHealth = async (): Promise<boolean> => {
  try {
    console.log("Checking emotion API health...");
    
    // Use a simple test query
    const testQuery = "test connection";
    const response = await fetch('https://emorag-arangodb-py-547962548252.us-central1.run.app/extract-emotions/qa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*'
      },
      body: JSON.stringify({ query: testQuery }),
      signal: AbortSignal.timeout(10000) // 10 second timeout for health check
    });
    
    console.log("Emotion API health check status:", response.status);
    
    if (!response.ok) {
      console.log("Emotion API appears to be offline:", response.status);
      return false;
    }
    
    // Try to get a valid response
    try {
      const data = await response.text();
      console.log("Emotion API health check response:", data);
      return !!data; // Return true if we got any meaningful data
    } catch (error) {
      console.error("Error parsing emotion API health check response:", error);
      return false;
    }
  } catch (error) {
    console.error("Emotion API health check failed:", error);
    return false;
  }
};

/**
 * Test the emotion API with a specific query and return detailed results
 */
export const testEmotionApi = async (query: string): Promise<{
  success: boolean;
  status?: number;
  data?: any;
  error?: string;
  parsedEmotion?: string;
}> => {
  try {
    console.log("Testing emotion API with query:", query);
    
    const response = await fetch('https://emorag-arangodb-py-547962548252.us-central1.run.app/extract-emotions/qa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*'
      },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(30000)
    });
    
    console.log("Emotion API test status:", response.status);
    
    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        error: `API returned status ${response.status}`
      };
    }
    
    // Try to get response as JSON first
    let data: any;
    let textData: string;
    let parsedEmotion = 'neutral';
    
    try {
      data = await response.clone().json();
      textData = JSON.stringify(data);
      console.log("Emotion API test JSON response:", data);
    } catch (jsonError) {
      // If JSON parsing fails, get as text
      textData = await response.text();
      console.log("Emotion API test text response:", textData);
    }
    
    // Parse the emotion from the response data
    if (data && data.data) {
      console.log("Test: Using object data format");
      const dataStr = data.data.toString();
      if (dataStr.includes(':')) {
        parsedEmotion = dataStr.split(':')[1]?.trim().toLowerCase() || 'neutral';
      }
    } 
    else if (textData.includes('Summary:')) {
      console.log("Test: Using Summary: format");
      parsedEmotion = textData.split('Summary:')[1]?.trim().toLowerCase() || 'neutral';
    } 
    else if (textData.includes(':')) {
      console.log("Test: Using basic colon format");
      parsedEmotion = textData.split(':')[1]?.trim().toLowerCase() || 'neutral';
    }
    
    console.log("Test parsed emotion:", parsedEmotion);
    
    return {
      success: true,
      status: response.status,
      data: data || textData,
      parsedEmotion
    };
  } catch (error: any) {
    console.error("Emotion API test error:", error);
    return {
      success: false,
      error: error.message || 'Unknown error'
    };
  }
};
