'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

const schema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters."),
  password_confirm: z.string()
}).refine((data) => data.password === data.password_confirm, {
  message: "Passwords do not match.",
  path: ["password_confirm"],
});

type FormData = z.infer<typeof schema>;

export default function PasswordResetConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset link. Missing token.");
      router.push('/login');
    }
  }, [token, router]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setError(null);
      await api.post('/users/password-reset/confirm/', {
        token,
        password: data.password,
        password_confirm: data.password_confirm
      });
      toast.success("Password reset successfully! You can now log in.");
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to reset password. The link may be expired.");
    }
  };

  if (!token) return null;

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center px-4 pt-28">
        <div className="card-minimal w-full max-w-md rounded-2xl p-8">
          <h1 className="mb-2 text-2xl font-bold tracking-tight text-black dark:text-white">Create New Password</h1>
          <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">Please enter your new password below.</p>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-xs font-semibold text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">New Password</label>
              <input 
                {...register('password')}
                type="password"
                className="input-minimal w-full rounded-lg px-4 py-3 text-sm text-black dark:text-white dark:bg-zinc-950 dark:border-zinc-800"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Confirm New Password</label>
              <input 
                {...register('password_confirm')}
                type="password"
                className="input-minimal w-full rounded-lg px-4 py-3 text-sm text-black dark:text-white dark:bg-zinc-950 dark:border-zinc-800"
                placeholder="••••••••"
              />
              {errors.password_confirm && <p className="text-xs text-red-500">{errors.password_confirm.message}</p>}
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-black dark:bg-white py-3.5 text-sm font-bold text-white dark:text-black transition-all hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
