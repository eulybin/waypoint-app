// (POST) login user
export const loginUser = async (userLoginData, signal) => {
  const requestOptions = {
    method: 'POST',
    body: JSON.stringify(userLoginData),
    headers: {
      'Content-Type': 'application/json',
    },
    signal,
  };

  try {
    const response = await fetch('url', requestOptions);
    let data;
    try {
      data = await response.json();
    } catch {
      data = { message: 'Server returned invalid JSON.' };
    }
    if (!response.ok) {
      throw new Error(data.message || 'Could not log in the user.');
    }
    if (data.token) {
      localStorage.setItem('token', data.token);
    } else {
      console.warn('No token received from the backend.');
    }
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('The request was aborted by the user or it timed out.');
    }
    console.error('Error in loginUser:', error);
    throw error;
  }
};
