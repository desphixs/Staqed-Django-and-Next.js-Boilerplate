'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

const schema = z.object({
  email: z.string().email("Invalid email address."),
});

type FormData = z.infer<typeof schema>;

export default function PasswordResetPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setError(null);
      await api.post('/users/password-reset/request/', data);
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to send reset link.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center px-4 pt-28">
        <div className="card-minimal w-full max-w-md rounded-2xl p-8">
          {!sent ? (
            <>
              <h1 className="mb-2 text-2xl font-bold tracking-tight text-black dark:text-white">Reset Password</h1>
              <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">Enter your email and we'll send you a link to reset your password.</p>

              {error && (
                <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-xs font-semibold text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Email Address</label>
                  <input 
                    {...register('email')}
                    type="email"
                    className="input-minimal w-full rounded-lg px-4 py-3 text-sm text-black dark:text-white dark:bg-zinc-950 dark:border-zinc-800"
                    placeholder="you@example.com"
                  />
                  {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-black dark:bg-white py-3.5 text-sm font-bold text-white dark:text-black transition-all hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </>
          ) : (
            <div className="py-4 text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-lg font-bold text-black dark:text-white">Check Your Email</h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">If an account exists, we've sent a password reset link to your inbox.</p>
              <Link href="/login" className="mt-6 inline-block text-xs font-bold text-zinc-400 hover:text-black dark:hover:text-white">Back to Login</Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
