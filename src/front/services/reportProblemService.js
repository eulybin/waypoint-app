import { API_ENDPOINTS } from '../utils/apiConfig';

export const reportProblem = async (formDataObj, signal) => {
  const requestOptions = {
    method: 'POST',
    body: formDataObj,
    signal,
  };

  try {
    const response = await fetch(`${API_ENDPOINTS.REPORT}`, requestOptions);

    let data;
    try {
      data = await response.json();
    } catch {
      data = { message: 'Server returned invalid JSON.' };
    }

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Could not send the report.');
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('Report request aborted.');
    }
    console.error('Error in reportProblem:', error);
    throw error;
  }
};
