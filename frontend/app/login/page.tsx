// This tells Next.js that this file is a "Client Component." 
// Because we handle user clicks, form typing, and browser redirects, it must run in the browser.
'use client';

// Standard React import for building our component.
import React, { useState } from 'react';
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
import { useRouter } from 'next/navigation';

/**
 * THE RULE BOOKS (Validation Schemas)
 * We now have different rules depending on HOW the user wants to log in.
 */
const passwordSchema = z.object({
  // Rule: The email must look like a real email.
  email: z.string().email("Invalid email address."),
  // Rule: Password is required for the standard login.
  password: z.string().min(1, "Password is required."),
});

const emailOnlySchema = z.object({
  // Rule: Only the email is needed to request a Magic Link or OTP.
  email: z.string().email("Invalid email address."),
});

const otpVerifySchema = z.object({
  // Rule: We need both the email and the 6-digit code to verify.
  email: z.string().email("Invalid email address."),
  otp: z.string().length(6, "OTP must be exactly 6 digits."),
});

// TypeScript helpers to define our form data shapes.
type PasswordForm = z.infer<typeof passwordSchema>;
type EmailOnlyForm = z.infer<typeof emailOnlySchema>;
type OtpVerifyForm = z.infer<typeof otpVerifySchema>;

export default function LoginPage() {
  // We extract the necessary auth functions from our AuthContext.
  const { login, requestMagicLink, requestOTP, verifyOTP } = useAuth();
  const router = useRouter();

  /**
   * PAGE STATE
   * 'method' tracks if we are doing Password, Magic Link, or OTP.
   * 'magicLinkSent' and 'otpSent' track if the request step was successful.
   * 'otpEmail' remembers the email used so the user doesn't have to re-type it.
   */
  const [method, setMethod] = useState<'password' | 'magic_link' | 'otp'>('password');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  
  // A place to store any error messages returned by the server.
  const [globalError, setGlobalError] = useState<string | null>(null);

  /**
   * THE FORM ENGINES
   * We initialize separate form handlers for each authentication type.
   */
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });
  const emailForm = useForm<EmailOnlyForm>({ resolver: zodResolver(emailOnlySchema) });
  const otpForm = useForm<OtpVerifyForm>({ resolver: zodResolver(otpVerifySchema) });

  /**
   * SUBMISSION HANDLERS
   * These functions talk to our backend via the AuthContext functions.
   */

  // Logic for standard Password login
  const onPasswordSubmit = async (data: PasswordForm) => {
    try {
      setGlobalError(null);
      await login(data);
    } catch (error: any) {
      setGlobalError(error.response?.data?.detail || "Login failed. Please check your credentials.");
    }
  };

  // Logic for requesting a Magic Link
  const onMagicLinkRequest = async (data: EmailOnlyForm) => {
    try {
      setGlobalError(null);
      await requestMagicLink(data.email);
      setMagicLinkSent(true);
    } catch (error: any) {
      setGlobalError(error.response?.data?.error || "Failed to send link.");
    }
  };

  // Logic for requesting an OTP code
  const onOtpRequest = async (data: EmailOnlyForm) => {
    try {
      setGlobalError(null);
      await requestOTP(data.email);
      setOtpEmail(data.email);
      otpForm.setValue('email', data.email);
      setOtpSent(true);
    } catch (error: any) {
      setGlobalError(error.response?.data?.error || "Failed to send code.");
    }
  };

  // Logic for verifying the OTP code
  const onOtpVerify = async (data: OtpVerifyForm) => {
    try {
      setGlobalError(null);
      await verifyOTP(data.email, data.otp);
    } catch (error: any) {
      setGlobalError(error.response?.data?.error || "Invalid or expired code.");
    }
  };

  /**
   * SOCIAL LOGIN LOGIC
   * Handles the redirection to Google and GitHub.
   */
  const handleSocialLogin = (provider: 'google' | 'github') => {
    const authUrls = {
      google: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_REDIRECT_URI}/google&response_type=code&scope=openid email profile`,
      github: `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_REDIRECT_URI}/github&scope=user:email`
    };
    window.location.href = authUrls[provider];
  };

  return (
    <div className="flex flex-col items-center justify-center px-4 pt-20">
      <div className="card-minimal w-full max-w-md rounded-2xl p-8">
        
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-black">Welcome Back</h1>
        <p className="mb-8 text-sm text-zinc-500">Sign in to your account to continue.</p>

        {/* TABS FOR SELECTING LOGIN METHOD */}
        {(!magicLinkSent && !otpSent) && (
          <div className="mb-8 flex gap-1 rounded-xl bg-zinc-100 p-1">
            <button 
              onClick={() => { setMethod('password'); setGlobalError(null); }}
              className={`flex-1 rounded-lg py-2 text-xs font-bold uppercase tracking-wider transition-all ${method === 'password' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-black'}`}
            >
              Password
            </button>
            <button 
              onClick={() => { setMethod('magic_link'); setGlobalError(null); }}
              className={`flex-1 rounded-lg py-2 text-xs font-bold uppercase tracking-wider transition-all ${method === 'magic_link' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-black'}`}
            >
              Magic Link
            </button>
            <button 
              onClick={() => { setMethod('otp'); setGlobalError(null); }}
              className={`flex-1 rounded-lg py-2 text-xs font-bold uppercase tracking-wider transition-all ${method === 'otp' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-black'}`}
            >
              OTP
            </button>
          </div>
        )}

        {/* ERROR DISPLAY */}
        {globalError && (
          <div className="mb-6 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600">
            {globalError}
          </div>
        )}

        {/* ==================== FORM: PASSWORD ==================== */}
        {method === 'password' && (
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Email Address</label>
              <input 
                {...passwordForm.register('email')}
                type="email"
                className="input-minimal w-full rounded-lg px-4 py-3 text-sm text-black"
                placeholder="you@example.com"
              />
              {passwordForm.formState.errors.email && <p className="text-xs text-red-500">{passwordForm.formState.errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Password</label>
              <input 
                {...passwordForm.register('password')}
                type="password"
                className="input-minimal w-full rounded-lg px-4 py-3 text-sm text-black"
                placeholder="••••••••"
              />
              {passwordForm.formState.errors.password && <p className="text-xs text-red-500">{passwordForm.formState.errors.password.message}</p>}
            </div>

            <button 
              type="submit"
              disabled={passwordForm.formState.isSubmitting}
              className="w-full rounded-lg bg-black py-3.5 text-sm font-bold text-white transition-all hover:bg-zinc-800 disabled:opacity-50"
            >
              {passwordForm.formState.isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>
        )}

        {/* ==================== FORM: MAGIC LINK ==================== */}
        {method === 'magic_link' && (
          <div>
            {!magicLinkSent ? (
              <form onSubmit={emailForm.handleSubmit(onMagicLinkRequest)} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Email Address</label>
                  <input 
                    {...emailForm.register('email')}
                    type="email"
                    className="input-minimal w-full rounded-lg px-4 py-3 text-sm text-black"
                    placeholder="you@example.com"
                  />
                  {emailForm.formState.errors.email && <p className="text-xs text-red-500">{emailForm.formState.errors.email.message}</p>}
                </div>
                <button 
                  type="submit"
                  disabled={emailForm.formState.isSubmitting}
                  className="w-full rounded-lg bg-black py-3.5 text-sm font-bold text-white transition-all hover:bg-zinc-800 disabled:opacity-50"
                >
                  {emailForm.formState.isSubmitting ? "Sending..." : "Email Magic Link"}
                </button>
              </form>
            ) : (
              <div className="py-4 text-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-lg font-bold text-black">Check Your Email</h3>
                <p className="mt-2 text-sm text-zinc-500">We've sent a sign-in link to {emailForm.getValues('email')}.</p>
                <button onClick={() => setMagicLinkSent(false)} className="mt-6 text-xs font-bold text-zinc-400 hover:text-black">Try another email</button>
              </div>
            )}
          </div>
        )}

        {/* ==================== FORM: OTP ==================== */}
        {method === 'otp' && (
          <div>
            {!otpSent ? (
              <form onSubmit={emailForm.handleSubmit(onOtpRequest)} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Email Address</label>
                  <input 
                    {...emailForm.register('email')}
                    type="email"
                    className="input-minimal w-full rounded-lg px-4 py-3 text-sm text-black"
                    placeholder="you@example.com"
                  />
                  {emailForm.formState.errors.email && <p className="text-xs text-red-500">{emailForm.formState.errors.email.message}</p>}
                </div>
                <button 
                  type="submit"
                  disabled={emailForm.formState.isSubmitting}
                  className="w-full rounded-lg bg-black py-3.5 text-sm font-bold text-white transition-all hover:bg-zinc-800 disabled:opacity-50"
                >
                  {emailForm.formState.isSubmitting ? "Sending..." : "Send Verification Code"}
                </button>
              </form>
            ) : (
              <form onSubmit={otpForm.handleSubmit(onOtpVerify)} className="space-y-5">
                <p className="text-center text-sm text-zinc-500">Enter the 6-digit code sent to <br/> <strong className="text-black">{otpEmail}</strong></p>
                
                <input type="hidden" {...otpForm.register('email')} />
                
                <div className="space-y-1">
                  <input 
                    {...otpForm.register('otp')}
                    type="text"
                    maxLength={6}
                    className="input-minimal w-full text-center text-2xl font-bold tracking-[0.5em] rounded-lg px-4 py-4 text-black"
                    placeholder="000000"
                  />
                  {otpForm.formState.errors.otp && <p className="text-center text-xs text-red-500">{otpForm.formState.errors.otp.message}</p>}
                </div>

                <button 
                  type="submit"
                  disabled={otpForm.formState.isSubmitting}
                  className="w-full rounded-lg bg-black py-3.5 text-sm font-bold text-white transition-all hover:bg-zinc-800 disabled:opacity-50"
                >
                  {otpForm.formState.isSubmitting ? "Verifying..." : "Verify & Sign In"}
                </button>
                <button type="button" onClick={() => setOtpSent(false)} className="w-full text-center text-xs font-bold text-zinc-400 hover:text-black">Use a different email</button>
              </form>
            )}
          </div>
        )}

        {/* SOCIAL LOGIN DIVIDER */}
        {(!magicLinkSent && !otpSent) && (
          <>
            <div className="my-8 flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-zinc-200"></div>
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest">Or continue with</span>
              <div className="h-[1px] flex-1 bg-zinc-200"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* GOOGLE BUTTON */}
              <button 
                onClick={() => handleSocialLogin('google')}
                className="flex items-center justify-center gap-3 rounded-lg border border-zinc-200 bg-white py-3 transition-all hover:bg-zinc-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-sm font-semibold text-black">Google</span>
              </button>

              {/* GITHUB BUTTON */}
              <button 
                onClick={() => handleSocialLogin('github')}
                className="flex items-center justify-center gap-3 rounded-lg border border-zinc-200 bg-white py-3 transition-all hover:bg-zinc-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" fill="#000000"/>
                </svg>
                <span className="text-sm font-semibold text-black">GitHub</span>
              </button>
            </div>
          </>
        )}

        <p className="mt-8 text-center text-sm text-zinc-500">
          New here?{' '}
          <Link href="/register" className="font-bold text-black hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}