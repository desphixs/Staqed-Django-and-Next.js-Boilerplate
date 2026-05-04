'use client';

import { useEffect, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const { provider } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { socialLogin } = useAuth();
  const hasCalled = useRef(false);

  useEffect(() => {
    const code = searchParams.get('code');
    
    if (code && provider && !hasCalled.current) {
      hasCalled.current = true;
      socialLogin(provider as string, code).catch((err) => {
        console.error('Social login failed:', err);
        // If it fails, take the user back to the login page
        router.push('/login');
      });
    } else if (!code && !hasCalled.current) {
        // If there's no code at all, just go back to login
        router.push('/login');
    }
  }, [provider, searchParams, socialLogin, router]);

  return (
    <div className="fixed inset-0 z-[100] flex h-screen w-screen flex-col items-center justify-center bg-white overflow-hidden">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-zinc-100 opacity-75"></div>
          <Loader2 className="relative h-12 w-12 animate-spin text-black stroke-[1.5]" />
        </div>
        <div className="space-y-1 text-center">
          <h2 className="text-lg font-semibold tracking-tight text-black">Authenticating</h2>
          <p className="text-sm font-medium text-zinc-500">Securely connecting your {provider} account...</p>
        </div>
      </div>
    </div>
  );
}
