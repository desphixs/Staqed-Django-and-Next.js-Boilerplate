// This tells Next.js that this file is a "Client Component." 
// Since we are using things like 'useState' (memory) and 'useEffect' (actions on start), it must run in the browser.
'use client'; 

// We import the standard React tools. 'createContext' makes a data bucket, 
// 'useContext' lets us use that bucket, and 'useState/useEffect' manage data and timing.
import React, { createContext, useContext, useState, useEffect } from 'react'; 
// We import our custom 'api' instance (the one we documented earlier) to talk to our backend server.
import api from '@/lib/api'; 
// This is a Next.js tool that allows us to move the user to different pages (like redirecting to the Home page).
import { useRouter } from 'next/navigation'; 

// This is a TypeScript "Interface." It acts like a checklist or a map, defining exactly 
// what information and functions this Auth system will provide to the rest of your app.
interface AuthContextType {
  user: any; // This will hold the user's personal info (like name and email).
  login: (credentials: any) => Promise<void>; // A function to handle signing in.
  register: (data: any) => Promise<void>; // A function to handle signing up.
  socialLogin: (provider: string, code: string) => Promise<void>; // A function to handle social login tokens.
  logout: () => void; // A function to kick the user out and clear their data.
  isAuthenticated: boolean; // A simple 'Yes' or 'No' (true/false) to check if someone is logged in.
  loading: boolean; // A way to tell the app "Wait, I'm still checking if there's an active session."
}

// We create the actual 'Context' (the bucket). It starts as 'undefined' because 
// it doesn't have any data until the app actually starts running.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This is the 'Provider' component. You wrap your entire app inside this so 
// every single component can "hear" what the Auth system has to say.
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // We create a 'user' state to store the logged-in person's data. It starts as 'null' (empty).
  const [user, setUser] = useState<any>(null); 
  // We create a 'loading' state. It starts as 'true' because the first thing the app 
  // does is check if the user was already logged in from a previous visit.
  const [loading, setLoading] = useState(true); 
  // We initialize the router so we can send users to the Home page or Login page when needed.
  const router = useRouter(); 

  // This 'useEffect' block runs exactly ONCE as soon as the app finishes loading in the browser.
  useEffect(() => {
    const checkUser = async () => {
      // We look inside the browser's 'LocalStorage' to see if there is an 'access_token' (a digital key).
      const token = localStorage.getItem('access_token'); 
      
      // If we found a key, we try to see if it's still valid.
      if (token) {
        try {
          // We call our backend at '/users/me/'. This is basically asking the server: 
          // "Here is my key; if it's good, tell me who I am."
          const response = await api.get('/users/me/');
          // If the server says "Yes," we save that user info into our app's memory.
          setUser(response.data.data); 
          // We are done checking, so we turn off the loading spinner.
          setLoading(false);
        } catch (err) {
          // If the server says "No" (the key is broken or old), we delete the key from the browser.
          localStorage.removeItem('access_token');
          // We make sure the user state is empty.
          setUser(null);
          // We stop the loading state.
          setLoading(false);
        }
      } else {
        // If there was no key to begin with, we just stop loading and stay in "Logged Out" mode.
        setLoading(false);
      }
    };
    // We execute the check function we just wrote above.
    checkUser();
  }, []);

  // This function handles the logic for logging in a user.
  const login = async (credentials: any) => {
    // We send the user's email and password to the server's login endpoint.
    const response = await api.post('/users/login/', credentials); 
    
    // We dig into the server's response to find the 'access' token (the key).
    const { access } = response.data.data; 
    // We save this key in LocalStorage so the user stays logged in even if they refresh the page.
    localStorage.setItem('access_token', access); 
    
    // Now that we are logged in, we immediately ask the server for the user's full profile details.
    const userResponse = await api.get('/users/me/');
    // We save that profile data into our app's memory.
    setUser(userResponse.data.data); 
    
    // We move the user away from the login page and into the main "Home" area.
    router.push('/'); 
  };

  // This function handles creating a new account.
  const register = async (data: any) => {
    // We send the new user's information (name, email, password) to the server.
    await api.post('/users/register/', data); 
    // After they successfully sign up, we send them to the login page so they can sign in for the first time.
    router.push('/login'); 
  };

  // This function handles logging the user out.
  const logout = () => {
    // We delete the digital key (token) from the browser's memory.
    localStorage.removeItem('access_token'); 
    // We wipe the user's data from the app's current state.
    setUser(null); 
    // we send the user back to the login screen.
    router.push('/login'); 
  };

  // This function handles logging in with a social provider (Google/GitHub)
  const socialLogin = async (provider: string, code: string) => {
    // We send the code we got from the social provider to our backend translator.
    const response = await api.post(`/users/${provider}/`, { code });
    
    // We extract the access token from the response.
    const { access } = response.data.data;
    // We save the token in the browser's memory.
    localStorage.setItem('access_token', access);
    
    // We fetch the real user data from our backend.
    const userResponse = await api.get('/users/me/');
    setUser(userResponse.data.data);
    
    // We send the user to the Home page.
    router.push('/');
  };

  return (
    // We provide all our variables and functions (user, login, logout, etc.) to the 'Value' prop.
    // 'isAuthenticated' is a shortcut: if 'user' exists, it's true. If 'user' is null, it's false.
    <AuthContext.Provider value={{ user, login, register, socialLogin, logout, isAuthenticated: !!user, loading }}>
      {/* The 'children' represents the rest of your app. They can now all access the Auth data. */}
      {children}  
    </AuthContext.Provider>
  );
};

// This is a custom "Hook." Instead of writing complicated code on every page, 
// you can just type 'const { user } = useAuth()' to get the user's info instantly.
export const useAuth = () => {
  const context = useContext(AuthContext);
  // This is a safety check: if you try to use Auth data in a place that isn't wrapped 
  // by the AuthProvider, it will throw an error to help you fix the bug.
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  // Return the auth data so the component can use it.
  return context;
};