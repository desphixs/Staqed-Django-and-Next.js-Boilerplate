'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const registerSchema = z.object({
  first_name: z.string().min(1, "Required."),
  last_name: z.string().min(1, "Required."),
  email: z.string().email("Invalid email."),
  password: z.string().min(8, "Min 8 chars."),
  password_confirm: z.string().min(1, "Required."),
}).refine((data) => data.password === data.password_confirm, {
  message: "Mismatch.",
  path: ["password_confirm"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser(data);
    } catch (error) {
      alert("Signup failed.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-4 pt-20">
      <div className="card-minimal w-full max-w-lg rounded-2xl p-8">
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-black">Create Account</h1>
        <p className="mb-8 text-sm text-zinc-500">Join Staqed and start building today.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">First Name</label>
            <input 
              {...register('first_name')}
              className="input-minimal w-full rounded-lg px-4 py-3 text-sm text-black"
              placeholder="Jane"
            />
            {errors.first_name && <p className="text-xs text-red-500">{errors.first_name.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Last Name</label>
            <input 
              {...register('last_name')}
              className="input-minimal w-full rounded-lg px-4 py-3 text-sm text-black"
              placeholder="Doe"
            />
            {errors.last_name && <p className="text-xs text-red-500">{errors.last_name.message}</p>}
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Email Address</label>
            <input 
              {...register('email')}
              type="email"
              className="input-minimal w-full rounded-lg px-4 py-3 text-sm text-black"
              placeholder="jane@example.com"
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Password</label>
            <input 
              {...register('password')}
              type="password"
              className="input-minimal w-full rounded-lg px-4 py-3 text-sm text-black"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Confirm</label>
            <input 
              {...register('password_confirm')}
              type="password"
              className="input-minimal w-full rounded-lg px-4 py-3 text-sm text-black"
              placeholder="••••••••"
            />
            {errors.password_confirm && <p className="text-xs text-red-500">{errors.password_confirm.message}</p>}
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-black py-4 text-sm font-bold text-white transition-all hover:bg-zinc-800 disabled:opacity-50 md:col-span-2"
          >
            {isSubmitting ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-black hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
