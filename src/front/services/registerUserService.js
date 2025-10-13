import { API_ENDPOINTS } from '../utils/apiConfig';

// (POST) register a new user
export const registerUser = async (newUserObject, signal) => {
  const requestOptions = {
    method: 'POST',
    body: JSON.stringify(newUserObject),
    headers: {
      'Content-Type': 'application/json',
    },
    signal,
  };

  try {
    const response = await fetch(API_ENDPOINTS.REGISTER, requestOptions);
    let data;
    try {
      data = await response.json();
    } catch {
      data = { message: 'Server returned invalid JSON.' };
    }
    if (!response.ok) {
      throw new Error(data.message || 'Could not register the user.');
    }
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('The request was aborted by the user or it timed out.');
    }
    console.error('Error in registerUser:', error);
    throw error;
  }
};
