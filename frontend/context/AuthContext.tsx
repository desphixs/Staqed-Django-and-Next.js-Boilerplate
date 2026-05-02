'use client'; // Mark as a client component for state and effects

import React, { createContext, useContext, useState, useEffect } from 'react'; // Import React tools
import api from '@/lib/api'; // Import our custom API client
import { useRouter } from 'next/navigation'; // Import navigation tools

// Define what information our Auth system will share with the app
interface AuthContextType {
  user: any; // The current user's data
  login: (credentials: any) => Promise<void>; // The function to log in
  register: (data: any) => Promise<void>; // The function to sign up
  logout: () => void; // The function to log out
  isAuthenticated: boolean; // True if the user is logged in
  loading: boolean; // True while we are checking the user's status
}

// Create the context (the "bucket" where the auth data lives)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null); // Store the user object
  const [loading, setLoading] = useState(true); // Start in a loading state
  const router = useRouter(); // Get the router for redirecting

  // Effect to check if a user is already logged in when the app starts
  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('access_token'); // Check for a token
      if (token) {
        try {
          // If token exists, ask the server "Who am I?" using the token
          const response = await api.get('/users/me/');
          setUser(response.data.data); // Set the real user data
          setLoading(false);
        } catch (err) {
          // If the token is invalid or expired, the interceptor will try to refresh it
          // If that also fails, we clear the token and stay logged out
          localStorage.removeItem('access_token');
          setUser(null);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = async (credentials: any) => {
    const response = await api.post('/users/login/', credentials); // Send login request
    
    // Accessing data through the Task 2 JSON wrapper (response.data.data)
    const { access } = response.data.data; 
    localStorage.setItem('access_token', access); // Save it locally
    
    // Immediately fetch the real user details
    const userResponse = await api.get('/users/me/');
    setUser(userResponse.data.data); 
    
    router.push('/'); // Go to the home page
  };

  const register = async (data: any) => {
    await api.post('/users/register/', data); // Send signup request
    router.push('/login'); // Go to login page after success
  };

  const logout = () => {
    localStorage.removeItem('access_token'); // Delete the token
    setUser(null); // Clear user state
    router.push('/login'); // Go back to login
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, loading }}>
      {children}  {/* Allow the rest of the app to see the auth data */}
    </AuthContext.Provider>
  );
};

// Custom hook to make using Auth data easy in components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
