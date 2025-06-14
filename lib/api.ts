import { ApiResponse, FormData } from './types';

// Function to call our internal API endpoint
export const analyzeInstagramProfile = async (data: FormData): Promise<ApiResponse> => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    // Check for HTTP errors
    if (!response.ok) {
      // Try to parse error message from response
      try {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to analyze profile',
          message: errorData.message || `HTTP error: ${response.status}`,
        };
      } catch (e) {
        // If error response can't be parsed as JSON
        return {
          success: false,
          error: 'Failed to analyze profile',
          message: `HTTP error: ${response.status}`,
        };
      }
    }
    
    // Parse successful response
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error in analyzeInstagramProfile:', error);
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to connect to the server. Please check your internet connection and try again.',
    };
  }
};

// Function to get estimated analysis progress
export const getAnalysisProgress = (startTime: number, maxWaitTime: number = 30000): number => {
  const elapsed = Date.now() - startTime;
  // Calculate percentage with some randomness to make it feel more natural
  let percentage = Math.min(100, Math.floor((elapsed / maxWaitTime) * 100));
  
  // Add some randomness to progress
  if (percentage < 95) {
    const jitter = Math.floor(Math.random() * 5);
    percentage = Math.min(95, percentage + jitter);
  }
  
  return percentage;
};