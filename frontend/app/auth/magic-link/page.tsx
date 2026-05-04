'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function MagicLinkVerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verifyMagicLink } = useAuth();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  
  const hasCalled = useRef(false);

  useEffect(() => {
    const token = searchParams.get('token');

    if (token && !hasCalled.current) {
      hasCalled.current = true;
      
      verifyMagicLink(token)
        .then(() => {
          setStatus('success');
          // Give user a brief moment to see success, then redirect
          setTimeout(() => router.push('/'), 1500);
        })
        .catch((err) => {
          console.error('Magic link verification failed:', err);
          setStatus('error');
          setErrorMessage(err.response?.data?.error || 'This link is invalid or has expired.');
        });
    } else if (!token && !hasCalled.current) {
      router.push('/login');
    }
  }, [searchParams, verifyMagicLink, router]);

  return (
    <div className="flex h-screen w-screen overflow-hidden flex-col items-center justify-center bg-white dark:bg-black px-4">
      <div className="card-minimal w-full max-w-md rounded-2xl p-8 text-center dark:bg-zinc-950 dark:border-zinc-800">
        
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-6 py-8">
            <Loader2 className="h-12 w-12 animate-spin text-black dark:text-white stroke-[1.5]" />
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-black dark:text-white">Authenticating</h2>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Verifying your secure magic link...</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-6 py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/30 text-green-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-black dark:text-white">Success!</h2>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">You are now securely signed in.</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-6 py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30 text-red-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-black dark:text-white">Link Expired</h2>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{errorMessage}</p>
            </div>
            <Link 
              href="/login" 
              className="mt-4 w-full rounded-lg bg-black dark:bg-white py-3.5 text-sm font-bold text-white dark:text-black transition-all hover:bg-zinc-800 dark:hover:bg-zinc-200"
            >
              Back to Login
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
