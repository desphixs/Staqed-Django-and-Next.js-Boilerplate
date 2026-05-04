// This tells Next.js that this file is a "Client Component." 
// Because we handle user clicks, form typing, and browser redirects, it must run in the browser.
'use client';

// Standard React import for building our component.
import React from 'react';
// 'useForm' is the engine that tracks what users type and manages the "life cycle" of the form.
import { useForm } from 'react-hook-form';
// 'zodResolver' is the bridge that lets our "Rule Book" (Zod) talk to our "Form Engine" (Hook Form).
import { zodResolver } from '@hookform/resolvers/zod';
// Zod is the library we use to define exactly what a "valid" login looks like.
import * as z from 'zod';
// We bring in 'useAuth' so we can actually tell the system to log the user in once the form is valid.
import { useAuth } from '@/context/AuthContext';
// 'Link' allows for fast navigation to the Register page without a full browser refresh.
import Link from 'next/link';

/**
 * THE RULE BOOK (Validation Schema)
 * Here, we define a Zod object that acts as a gatekeeper for our data.
 */
const loginSchema = z.object({
  // Rule: The email must be a string and it MUST look like a real email (e.g., user@domain.com).
  // If it's not valid, Zod will automatically generate the "Invalid email address" message.
  email: z.string().email("Invalid email address."),
  
  // Rule: The password must be a string. 'min(1)' ensures the user can't leave it blank.
  // If they try to sign in with an empty password, they see the error message below.
  password: z.string().min(1, "Password is required."),
});

// This line tells TypeScript to look at our "Rule Book" (loginSchema) and 
// automatically create a "Type" for us so our code knows exactly what a Login Form looks like.
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  // We extract the 'login' function from our AuthContext. 
  // This is the function that actually talks to our backend to start a session.
  const { login } = useAuth();
  
  /**
   * THE FORM ENGINE
   * 'register' links our inputs (HTML) to the logic.
   * 'handleSubmit' is a wrapper that runs validation before letting us submit data.
   * 'errors' lets us show red text when the user makes a mistake.
   * 'isSubmitting' is a boolean that turns 'true' while the login request is traveling to the server.
   */
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    // We tell the form engine to use our Zod "Rule Book" from above.
    resolver: zodResolver(loginSchema),
  });

  /**
   * FORM SUBMISSION LOGIC
   * This function only runs if the email and password pass all the Zod rules.
   */
  const onSubmit = async (data: LoginForm) => {
    try {
      // We take the validated data (email/password) and send it to our login function.
      await login(data);
    } catch (error) {
      // If the server says "Hey, this password is wrong!", we log that error here.
      console.error("Login failed:", error); 
    }
  };

  /**
   * SOCIAL LOGIN LOGIC
   * This function handles moving the user away from our site and over to Google or GitHub.
   */
  const handleSocialLogin = (provider: 'google' | 'github') => {
    // We construct specific URLs for the "OAuth" process. 
    // We send our 'Client ID' so Google/GitHub knows which app is asking for permission.
    const authUrls = {
      // For Google: we ask for the 'openid', 'email', and 'profile' so we know who the user is.
      google: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_REDIRECT_URI}/google&response_type=code&scope=openid email profile`,
      
      // For GitHub: we specifically ask for the 'user:email' permission.
      github: `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_REDIRECT_URI}/github&scope=user:email`
    };
    
    // This line physically moves the user's browser to the login page of the chosen provider.
    window.location.href = authUrls[provider];
  };

  return (
    <div className="flex flex-col items-center justify-center px-4 pt-20">
      <div className="card-minimal w-full max-w-md rounded-2xl p-8">
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-black">Welcome Back</h1>
        <p className="mb-8 text-sm text-zinc-500">Please enter your details to sign in.</p>

        {/* The standard form setup. 'handleSubmit' stops the page from refreshing. */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Email</label>
            <input 
              // We 'spread' the register function onto the input to track it as 'email'.
              {...register('email')}
              type="email"
              className="input-minimal w-full rounded-lg px-4 py-3 text-sm text-black"
              placeholder="you@example.com"
            />
            {/* If Zod finds an error with the email, we show it here. */}
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Password</label>
            <input 
              // We 'spread' the register function onto the input to track it as 'password'.
              {...register('password')}
              type="password"
              className="input-minimal w-full rounded-lg px-4 py-3 text-sm text-black"
              placeholder="••••••••"
            />
            {/* If Zod finds an error with the password (like it's empty), we show it here. */}
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <button 
            type="submit"
            // We disable the button while 'isSubmitting' is true to prevent the user from clicking 100 times.
            disabled={isSubmitting}
            className="w-full rounded-lg bg-black py-3.5 text-sm font-bold text-white transition-all hover:bg-zinc-800 disabled:opacity-50"
          >
            {/* Change the text dynamically based on the current state of the request. */}
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* VISUAL DIVIDER: Just some logic to show the "Or continue with" text between lines. */}
        <div className="my-8 flex items-center gap-4">
          <div className="h-[1px] flex-1 bg-zinc-200"></div>
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest">Or continue with</span>
          <div className="h-[1px] flex-1 bg-zinc-200"></div>
        </div>

        {/* SOCIAL LOGIN BUTTONS */}
        <div className="grid grid-cols-2 gap-4">
          {/* GOOGLE BUTTON */}
          <button 
            // When clicked, run our social login function specifically for 'google'.
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

          {/* GITHUB BUTTON */}
          <button 
            // When clicked, run our social login function specifically for 'github'.
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
          New here?{' '}
          {/* A simple link to the registration page. */}
          <Link href="/register" className="font-bold text-black hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}