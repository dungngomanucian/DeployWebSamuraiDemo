const API_BASE_URL = import.meta.env.API_BASE_URL || 'http://localhost:8000/api/v1';

/* Helper function to make API requests */
export async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    return { data: null, error: error.message };
  }
}