
// API utility functions
import { mockApiHealth, mockEmotionApi } from './mockApi';

// Flag to control whether we use the real API or mock
const USE_MOCK_API = true;

/**
 * Simple health check for the emotion API to determine if it's available
 */
export const checkEmotionApiHealth = async (): Promise<boolean> => {
  // If we're using mocks, return the mock implementation
  if (USE_MOCK_API) {
    console.log("Using mock API health check...");
    return await mockApiHealth();
  }

  try {
    console.log("Checking emotion API health...");
    
    // Use a simple test query
    const testQuery = "test connection";
    
    // Log the full request details
    console.log("Making health check request:", {
      url: 'https://emorag-arangodb-py-547962548252.us-central1.run.app/extract-emotions/qa',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*'
      },
      body: JSON.stringify({ query: testQuery })
    });
    
    const response = await fetch('https://emorag-arangodb-py-547962548252.us-central1.run.app/extract-emotions/qa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*'
      },
      body: JSON.stringify({ query: testQuery }),
      signal: AbortSignal.timeout(15000) // Extended timeout for health check
    }).catch(fetchError => {
      console.error("Fetch error details:", fetchError);
      throw new Error(`Network error: ${fetchError.message}`);
    });
    
    console.log("Emotion API health check status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unable to get error details");
      console.error("API error response:", errorText);
      throw new Error(`API returned status ${response.status}: ${errorText}`);
    }
    
    // Try to get a valid response
    try {
      const data = await response.text();
      console.log("Emotion API health check response:", data);
      
      // Check if we got a meaningful response
      if (!data || data.trim() === '') {
        console.warn("Empty response from API");
        return false;
      }
      
      return true;
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
  apiEndpoint?: string;
}> => {
  // If we're using mocks, return the mock implementation
  if (USE_MOCK_API) {
    console.log("Using mock emotion API...");
    return await mockEmotionApi(query);
  }

  // Define multiple endpoints to try in case the primary one fails
  const endpoints = [
    'https://emorag-arangodb-py-547962548252.us-central1.run.app/extract-emotions/qa',
    // If there's a backup endpoint, add it here
  ];
  
  console.log("Testing emotion API with query:", query);
  
  // Try each endpoint in sequence
  for (const endpoint of endpoints) {
    try {
      console.log(`Trying endpoint: ${endpoint}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*'
        },
        body: JSON.stringify({ query }),
        signal: controller.signal,
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit' // Don't send cookies for cross-origin requests
      }).catch(fetchError => {
        console.error(`Fetch error for ${endpoint}:`, fetchError);
        throw fetchError;
      });
      
      clearTimeout(timeoutId);
      
      console.log(`API test status for ${endpoint}:`, response.status);
      console.log("Response headers:", Object.fromEntries([...response.headers]));
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => "No error details available");
        console.error(`API error response from ${endpoint}:`, errorText);
        throw new Error(`API returned status ${response.status}: ${errorText}`);
      }
      
      // Try to get response as JSON first
      let data: any;
      let textData: string;
      let parsedEmotion = 'neutral';
      
      try {
        const responseClone = response.clone();
        data = await responseClone.json();
        textData = JSON.stringify(data);
        console.log(`API JSON response from ${endpoint}:`, data);
      } catch (jsonError) {
        // If JSON parsing fails, get as text
        textData = await response.text();
        console.log(`API text response from ${endpoint}:`, textData);
      }
      
      // Parse the emotion from the response data
      if (data && data.data) {
        console.log("Using object data format");
        const dataStr = data.data.toString();
        if (dataStr.includes(':')) {
          parsedEmotion = dataStr.split(':')[1]?.trim().toLowerCase() || 'neutral';
        }
      } 
      else if (textData.includes('Summary:')) {
        console.log("Using Summary: format");
        parsedEmotion = textData.split('Summary:')[1]?.trim().toLowerCase() || 'neutral';
      } 
      else if (textData.includes(':')) {
        console.log("Using basic colon format");
        parsedEmotion = textData.split(':')[1]?.trim().toLowerCase() || 'neutral';
      }
      
      console.log("Parsed emotion:", parsedEmotion);
      
      return {
        success: true,
        status: response.status,
        data: data || textData,
        parsedEmotion,
        apiEndpoint: endpoint
      };
    } catch (error: any) {
      console.error(`Error with endpoint ${endpoint}:`, error);
      
      // If this is the last endpoint, return the error
      if (endpoint === endpoints[endpoints.length - 1]) {
        return {
          success: false,
          error: `All API endpoints failed. Last error: ${error.message || 'Unknown error'}`
        };
      }
      
      // Otherwise, continue to the next endpoint
      console.log("Trying next endpoint...");
    }
  }
  
  // This should never be reached as the loop should return or throw
  return {
    success: false,
    error: 'Failed to connect to any API endpoint'
  };
};
