// (POST) Send Report a Problem Form Data to Backend
export const reportProblem = async (formDataObj) => {
  // using FormData object does not require headers prop
  const requestOptions = {
    method: 'POST',
    body: formDataObj,
  };
  try {
    const response = await fetch('url', requestOptions);
    if (!response.ok) {
      throw new Error('Could not send the form data from Report a Problem modal.');
    }
    //need to make sure that the backend returns json, otherwise we get an ERROR here...
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
};
