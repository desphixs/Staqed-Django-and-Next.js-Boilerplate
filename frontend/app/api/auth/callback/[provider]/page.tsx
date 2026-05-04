// This tells Next.js that this file must be executed on the browser (client-side) because it uses hooks and browser APIs.
'use client';

// Importing standard React hooks for handling side effects and storing persistent values that don't trigger a re-render.
import { useEffect, useRef } from 'react';
// Importing Next.js navigation tools to read URL parameters and move the user to different pages.
import { useParams, useSearchParams, useRouter } from 'next/navigation';
// Importing a custom authentication hook to access the function that handles the social login logic.
import { useAuth } from '@/context/AuthContext';
// Importing a spinner icon from a UI library to show the user that something is happening.
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  // useParams extracts the dynamic part of the URL (e.g., in /auth/google, 'google' is the provider).
  const { provider } = useParams();
  // useSearchParams allows us to read the query string at the end of the URL (e.g., ?code=12345).
  const searchParams = useSearchParams();
  // useRouter gives us the 'push' method to navigate the user to different pages programmatically.
  const router = useRouter();
  // We extract the socialLogin function from our AuthContext to actually send the data to our backend.
  const { socialLogin } = useAuth();
  
  // This 'ref' acts as a flag to prevent the login logic from running twice (which often happens in React Strict Mode).
  const hasCalled = useRef(false);

  // This hook runs as soon as the page loads and whenever the variables in the dependency array change.
  useEffect(() => {
    // We grab the unique 'code' string sent back from the social provider (Google, GitHub, etc.) from the URL.
    const code = searchParams.get('code');
    
    // Logic: If we have a code, a provider, and we haven't already attempted to log in during this session...
    if (code && provider && !hasCalled.current) {
      // We immediately set 'hasCalled' to true so this block of code never runs again for this page load.
      hasCalled.current = true;
      
      // We call the socialLogin function, passing the provider name and the secret code to our backend API.
      socialLogin(provider as string, code).catch((err) => {
        // If the backend says the code is invalid or the login fails, we log the error for debugging.
        console.error('Social login failed:', err);
        // Since the login failed, we redirect the user back to the login page to try again.
        router.push('/login');
      });
    } 
    // Logic: If the page loads but there is no 'code' found in the URL at all...
    else if (!code && !hasCalled.current) {
        // We assume the user landed here by mistake or the login was cancelled, so we send them back to the login page.
        router.push('/login');
    }
    // The dependency array ensures this effect re-evaluates if any of these external tools or values change.
  }, [provider, searchParams, socialLogin, router]);

  // The UI returned below is a full-screen loading state that the user sees while the 'useEffect' is talking to the backend.
  return (
    <div className="fixed inset-0 z-[100] flex h-screen w-screen flex-col items-center justify-center bg-white dark:bg-black overflow-hidden">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          {/* A pulsing background effect to make the loading screen feel more interactive. */}
          <div className="absolute inset-0 animate-ping rounded-full bg-zinc-100 dark:bg-zinc-900 opacity-75"></div>
          {/* The actual spinning icon. */}
          <Loader2 className="relative h-12 w-12 animate-spin text-black dark:text-white stroke-[1.5]" />
        </div>
        <div className="space-y-1 text-center">
          {/* Primary status text. */}
          <h2 className="text-lg font-semibold tracking-tight text-black dark:text-white">Authenticating</h2>
          {/* Dynamic sub-text that tells the user exactly which account (e.g., Google) is being connected. */}
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Securely connecting your {provider} account...</p>
        </div>
      </div>
    </div>
  );
}