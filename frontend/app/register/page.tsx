// This tells Next.js that this component runs in the browser. 
// We need this because we are using forms, state, and redirecting the user's window.
'use client';

import React from 'react';
// 'useForm' is our tool for tracking what the user types without having to manually manage 5 different state variables.
import { useForm } from 'react-hook-form';
// 'zodResolver' allows our validation rules (Zod) to talk to our form manager (React Hook Form).
import { zodResolver } from '@hookform/resolvers/zod';
// Zod is used to create a "Blueprint" of what valid data looks like.
import * as z from 'zod';
// We import our custom Auth system to actually send the new user's data to our database.
import { useAuth } from '@/context/AuthContext';
// 'Link' is for moving between pages quickly without a full page reload.
import Link from 'next/link';

/**
 * THE REGISTRATION BLUEPRINT (Schema)
 * This is where we set the rules for what a "Real" user account must look like.
 */
const registerSchema = z.object({
  // Rule: First name cannot be empty.
  first_name: z.string().min(1, "Required."),
  // Rule: Last name cannot be empty.
  last_name: z.string().min(1, "Required."),
  // Rule: Must be a properly formatted email address (e.g., name@site.com).
  email: z.string().email("Invalid email."),
  // Rule: Password must be at least 8 characters long for better security.
  password: z.string().min(8, "Min 8 chars."),
  // Rule: The confirmation field also cannot be empty.
  password_confirm: z.string().min(1, "Required."),
})
/**
 * THE CUSTOM DOUBLE-CHECK
 * This '.refine' block is a special rule that runs after the basic rules are met.
 * It compares the 'password' field to the 'password_confirm' field.
 */
.refine((data) => data.password === data.password_confirm, {
  // If the passwords do not match exactly, this is the error message shown.
  message: "Mismatch.",
  // This tells the app to attach the "Mismatch" error specifically to the 'password_confirm' input.
  path: ["password_confirm"],
});

// This line automatically creates a TypeScript "Type" based on the rules we just wrote above.
type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  // We grab the 'register' function from our AuthContext and rename it to 'registerUser' 
  // so it doesn't clash with the 'register' function from React Hook Form.
  const { register: registerUser } = useAuth();
  
  /**
   * INITIALIZING THE FORM
   * 'register' links our HTML inputs to our logic.
   * 'handleSubmit' is a gatekeeper that only lets the data through if it passes our Zod rules.
   * 'formState' gives us live updates on errors and whether the form is currently "busy" (isSubmitting).
   */
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    // We tell the form to use our Zod Blueprint to validate everything.
    resolver: zodResolver(registerSchema),
  });

  /**
   * ON SUBMIT LOGIC
   * This function runs after Zod gives us the "Green Light."
   */
  const onSubmit = async (data: RegisterForm) => {
    try {
      // We send the validated data (names, email, and password) to our Auth system.
      await registerUser(data);
    } catch (error) {
      // If the email is already taken or the server is down, we show a basic alert.
      alert("Signup failed.");
    }
  };

  /**
   * SOCIAL LOGIN REDIRECT LOGIC
   * This function builds a "Bridge" to Google or GitHub.
   */
  const handleSocialLogin = (provider: 'google' | 'github') => {
    // We create the specific web addresses required by Google and GitHub to start their login process.
    const authUrls = {
      // For Google: We provide our Client ID and a 'redirect_uri' (where the user goes after they click "Allow").
      google: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_REDIRECT_URI}/google&response_type=code&scope=openid email profile`,
      // For GitHub: We do the same, but specifically ask for 'user:email' permission.
      github: `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_REDIRECT_URI}/github&scope=user:email`
    };
    // This line physically pushes the user's browser to the external Google or GitHub site.
    window.location.href = authUrls[provider];
  };

  return (
    <div className="flex flex-col items-center justify-center px-4 pt-20">
      <div className="card-minimal w-full max-w-lg rounded-2xl p-8">
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-black">Create Account</h1>
        <p className="mb-8 text-sm text-zinc-500">Join Staqed and start building today.</p>

        {/* 'handleSubmit' prevents the page from refreshing and triggers our 'onSubmit' function. */}
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-5 md:grid-cols-2">
          
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">First Name</label>
            <input 
              // {...register('first_name')} tells the form engine to track this input as 'first_name'.
              {...register('first_name')}
              className="input-minimal w-full rounded-lg px-4 py-3 text-sm text-black"
              placeholder="Jane"
            />
            {/* If the user leaves this blank, this red text appears. */}
            {errors.first_name && <p className="text-xs text-red-500">{errors.first_name.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Last Name</label>
            <input 
              // Connects this input to the 'last_name' validation logic.
              {...register('last_name')}
              className="input-minimal w-full rounded-lg px-4 py-3 text-sm text-black"
              placeholder="Doe"
            />
            {/* If the user leaves this blank, this red text appears. */}
            {errors.last_name && <p className="text-xs text-red-500">{errors.last_name.message}</p>}
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Email Address</label>
            <input 
              // Connects this input to the 'email' validation logic (including the @ check).
              {...register('email')}
              type="email"
              className="input-minimal w-full rounded-lg px-4 py-3 text-sm text-black"
              placeholder="jane@example.com"
            />
            {/* If the email is invalid, the error message appears here. */}
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Password</label>
            <input 
              // Connects this input to the 'password' logic (minimum 8 characters).
              {...register('password')}
              type="password"
              className="input-minimal w-full rounded-lg px-4 py-3 text-sm text-black"
              placeholder="••••••••"
            />
            {/* If the password is less than 8 characters, this tells the user. */}
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Confirm</label>
            <input 
              // This is the input that gets compared to the first password.
              {...register('password_confirm')}
              type="password"
              className="input-minimal w-full rounded-lg px-4 py-3 text-sm text-black"
              placeholder="••••••••"
            />
            {/* If the two passwords don't match, the "Mismatch" error appears here. */}
            {errors.password_confirm && <p className="text-xs text-red-500">{errors.password_confirm.message}</p>}
          </div>

          <button 
            type="submit"
            // If the form is currently talking to the server, we disable the button so the user doesn't click twice.
            disabled={isSubmitting}
            className="w-full rounded-lg bg-black py-4 text-sm font-bold text-white transition-all hover:bg-zinc-800 disabled:opacity-50 md:col-span-2"
          >
            {/* If loading, show "Creating account..."; otherwise, show the default "Sign Up". */}
            {isSubmitting ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {/* Visual divider logic to separate the standard form from the Social buttons. */}
        <div className="my-8 flex items-center gap-4">
          <div className="h-[1px] flex-1 bg-zinc-200"></div>
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest">Or continue with</span>
          <div className="h-[1px] flex-1 bg-zinc-200"></div>
        </div>

        {/* SOCIAL BUTTONS CONTAINER */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            // Triggers the Google redirect logic we wrote earlier.
            onClick={() => handleSocialLogin('google')}
            className="flex items-center justify-center gap-3 rounded-lg border border-zinc-200 bg-white py-3 transition-all hover:bg-zinc-50"
          >
            {/* Google Icon SVG */}
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-sm font-semibold text-black">Google</span>
          </button>

          <button 
            // Triggers the GitHub redirect logic we wrote earlier.
            onClick={() => handleSocialLogin('github')}
            className="flex items-center justify-center gap-3 rounded-lg border border-zinc-200 bg-white py-3 transition-all hover:bg-zinc-50"
          >
            {/* GitHub Icon SVG */}
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" fill="#000000"/>
            </svg>
            <span className="text-sm font-semibold text-black">GitHub</span>
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-zinc-500">
          Already have an account?{' '}
          {/* A simple link to jump back to the Login page. */}
          <Link href="/login" className="font-bold text-black hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}