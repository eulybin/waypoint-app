// (POST) Send Report a Problem Form Data to Backend
export const reportProblem = async (formDataObj, signal) => {
  const requestOptions = {
    method: 'POST',
    body: formDataObj,
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
      throw new Error(data.message || 'Could not send the form data from Report a Problem modal.');
    }
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('The request was aborted by the user or it timed out.');
    }
    console.error('Error in reportProblem:', error);
    throw error;
  }
};
