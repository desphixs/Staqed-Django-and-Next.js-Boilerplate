// This directive tells Next.js that this specific file is a "Client Component," 
// meaning it needs to run in the user's web browser so it can handle clicks, typing, and state.
'use client';

// We import React to build the component structure.
import React from 'react';
// This hook is the "engine" of the form; it tracks what the user types and manages the form's lifecycle.
import { useForm } from 'react-hook-form';
// This is a bridge that allows the React Hook Form to understand and use our Zod validation rules.
import { zodResolver } from '@hookform/resolvers/zod';
// Zod is a library used to define a "schema"—basically a list of strict rules for our data.
import * as z from 'zod';
// We pull in our custom authentication context so we can actually perform the login action.
import { useAuth } from '@/context/AuthContext';
// This is a special Next.js component that lets users navigate to other pages without refreshing the browser.
import Link from 'next/link';

// Here we define the "Rule Book" (Schema) for the login form. 
// If the data entered doesn't match these rules, the form will stop the user and show an error.
const loginSchema = z.object({
  // Rule: The email must be a string and it MUST be formatted like a real email address (e.g., name@site.com).
  email: z.string().email("Invalid email address."),
  // Rule: The password must be a string and must have at least 1 character (it cannot be empty).
  password: z.string().min(1, "Password is required."),
});

// This line automatically creates a TypeScript "blueprint" based on the rules we just defined above.
type LoginForm = z.infer<typeof loginSchema>;

// This is the main function that displays the Login Page.
export default function LoginPage() {
  // We extract the 'login' function from our AuthContext so we can send the user's details to our server.
  const { login } = useAuth();
  
  // Here we set up the form tools. 
  // 'register' connects inputs to the logic.
  // 'handleSubmit' is a wrapper that checks validation before running our submit function.
  // 'formState' gives us live updates on errors and whether the form is currently "loading" (isSubmitting).
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    // We tell the form to use our Zod schema (loginSchema) to validate the inputs.
    resolver: zodResolver(loginSchema),
  });

  // This function runs only after the form is filled out correctly. 
  // It receives the 'data' (the email and password) from the form.
  const onSubmit = async (data: LoginForm) => {
    try {
      // We call the login function from our AuthContext and wait for it to finish.
      await login(data);
    } catch (error) {
      // If the login fails (e.g., wrong password or server error), we log the error to the developer console.
      console.error("Login failed:", error); 
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-4 pt-20">
      <div className="card-minimal w-full max-w-md rounded-2xl p-8">
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-black">Welcome Back</h1>
        <p className="mb-8 text-sm text-zinc-500">Please enter your details to sign in.</p>

        {/* The form uses 'handleSubmit' to intercept the submit event, validate the data, and then run our 'onSubmit' logic. */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Email</label>
            <input 
              // The {...register('email')} tells React Hook Form to track this specific input under the name "email".
              {...register('email')}
              type="email"
              className="input-minimal w-full rounded-lg px-4 py-3 text-sm text-black"
              placeholder="you@example.com"
            />
            {/* If there is a validation error for the email field, this line displays the error message in red text. */}
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Password</label>
            <input 
              // This connects this input to the form logic under the name "password".
              {...register('password')}
              type="password"
              className="input-minimal w-full rounded-lg px-4 py-3 text-sm text-black"
              placeholder="••••••••"
            />
            {/* If the password field is left empty, this line displays the "Password is required" message. */}
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <button 
            type="submit"
            // If the form is currently in the middle of a login request, we disable the button to prevent the user from clicking it twice.
            disabled={isSubmitting}
            className="w-full rounded-lg bg-black py-3.5 text-sm font-bold text-white transition-all hover:bg-zinc-800 disabled:opacity-50"
          >
            {/* If 'isSubmitting' is true, the button shows "Signing in..."; otherwise, it shows "Sign In". */}
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-zinc-500">
          New here?{' '}
          {/* This Link allows the user to go to the Registration page without a full page reload. */}
          <Link href="/register" className="font-bold text-black hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}