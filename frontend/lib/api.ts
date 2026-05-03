// Import the Axios library, which is a popular tool for making web requests (getting or sending data).
import axios from 'axios';

// We create a "custom instance" of axios. Think of this as a pre-configured phone 
// that already knows which number to dial and how to behave on every call.
const api = axios.create({
  // This is the 'Home Address' of your backend API. It checks your environment 
  // variables first, but defaults to your local computer (127.0.0.1) if nothing is set.
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api', 
  
  // This is crucial for security. It tells the browser to send "HttpOnly" cookies 
  // (like your session ID) along with every request automatically.
  withCredentials: true, 
  
  // We tell the server that whenever we send data, it will be in 'JSON' format, 
  // which is the standard language for modern web applications.
  headers: {
    'Content-Type': 'application/json',
  },
});

/** 
 * REQUEST INTERCEPTOR
 * Think of this as a security guard who checks everyone leaving the building.
 * Before any request actually goes out to the internet, this function "intercepts" it.
 */
api.interceptors.request.use((config) => {
  // We check if we are running in the browser (window) rather than on the server.
  // If we are, we look in the browser's "LocalStorage" to see if we have an 'access_token'.
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  
  // If we found a token, we attach it to the 'Authorization' header.
  // This is like showing a VIP badge so the server knows who is making the request.
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // We return the modified configuration so the request can continue its journey.
  return config;
});

/** 
 * RESPONSE INTERCEPTOR
 * This is like a receptionist who checks the mail before giving it to you.
 * It looks at the server's answer to see if there were any issues.
 */
api.interceptors.response.use(
  // If the server's response is successful (Status 200), we just pass it along.
  (response) => response,
  
  // If something went wrong (like an error), this block runs.
  async (error) => {
    // We save the details of the request that just failed so we can try it again later.
    const originalRequest = error.config;

    // We check if the error is a '401' (Unauthorized). 
    // This usually means your access token has expired and is no longer valid.
    // We also check '!originalRequest._retry' to make sure we don't get stuck in an infinite loop.
    if (error.response?.status === 401 && !originalRequest._retry) {
      // We mark this request as a 'retry' so we only try to fix it once.
      originalRequest._retry = true;

      try {
        // We stop everything and ask the server for a brand new access token.
        // We use a specific 'refresh' endpoint to do this.
        const response = await axios.post(
          `${api.defaults.baseURL}/users/token/refresh/`,
          {},
          { withCredentials: true } // We send our refresh cookie to prove who we are.
        );

        // We grab the new access token from the server's response.
        // In this specific setup, the data is nested inside a 'data' wrapper.
        const { access } = response.data.data; 
        
        // We save the fresh new token back into LocalStorage for future use.
        localStorage.setItem('access_token', access);

        // We update the 'Authorization' header of the original failed request 
        // with our brand new token.
        originalRequest.headers.Authorization = `Bearer ${access}`;
        
        // Finally, we "replay" the original request. The user won't even 
        // notice that their token expired; the data just shows up!
        return api(originalRequest);
        
      } catch (refreshError) {
        // If the refresh attempt fails (e.g., the user has been logged out completely),
        // we clean up by removing the dead token from LocalStorage.
        localStorage.removeItem('access_token');
        
        // We send back the error so the app knows the user needs to log in again.
        return Promise.reject(refreshError);
      }
    }

    // If the error wasn't a 401 (maybe a 404 or 500), we just pass the error along.
    return Promise.reject(error);
  }
);

// We export this 'api' instance so we can use it in our other files to make clean, 
// secure API calls.
export default api;