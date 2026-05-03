// This tells Next.js that this component should be rendered on the browser (client-side) rather than the server.
'use client';

// Import the core React library to use its features and hooks.
import React from 'react';
// Import 'useForm', the main hook from React Hook Form that manages the form's state and validation.
import { useForm } from 'react-hook-form';
// Import 'zodResolver' to act as a bridge between the Zod validation library and React Hook Form.
import { zodResolver } from '@hookform/resolvers/zod';
// Import 'z' from Zod, which is a library used to create a "schema" or blueprint for data validation.
import * as z from 'zod';
// Import a custom 'useAuth' hook that likely contains the logic for registering or logging in users.
import { useAuth } from '@/context/AuthContext';
// Import the 'Link' component from Next.js to allow for fast, client-side navigation between pages.
import Link from 'next/link';

// Create a validation schema (a set of rules) that the form data must follow before it can be submitted.
const registerSchema = z.object({
  // Ensure 'first_name' is a string and has at least one character; if not, show the "Required" error message.
  first_name: z.string().min(1, "Required."),
  // Ensure 'last_name' is a string and has at least one character; if not, show the "Required" error message.
  last_name: z.string().min(1, "Required."),
  // Ensure the 'email' input is a valid email format; if not, show "Invalid email."
  email: z.string().email("Invalid email."),
  // Ensure the 'password' is at least 8 characters long; if not, show "Min 8 chars."
  password: z.string().min(8, "Min 8 chars."),
  // Ensure 'password_confirm' is not empty.
  password_confirm: z.string().min(1, "Required."),
})
// This 'refine' block is a custom check to ensure that the password and the confirmation password match perfectly.
.refine((data) => data.password === data.password_confirm, {
  // If the passwords don't match, this error message is triggered.
  message: "Mismatch.",
  // This tells the form to attach the error message specifically to the 'password_confirm' input field.
  path: ["password_confirm"],
});

// This line automatically creates a TypeScript "Type" based on the validation rules we defined in 'registerSchema'.
type RegisterForm = z.infer<typeof registerSchema>;

// This is the main function for the Registration Page component.
export default function RegisterPage() {
  // Extract the registration logic from our Auth Context and rename it 'registerUser' to avoid confusion with the form hook.
  const { register: registerUser } = useAuth();
  
  // Initialize the form hook. 
  // 'register' tracks input values, 'handleSubmit' manages the submission flow, 
  // and 'formState' gives us access to error messages and the loading status.
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    // We tell the form to use our Zod schema to validate the data every time the user types or submits.
    resolver: zodResolver(registerSchema),
  });

  // This function runs only after the form passes all validation rules. It receives the validated 'data'.
  const onSubmit = async (data: RegisterForm) => {
    try {
      // Send the validated user data (name, email, password) to our authentication function.
      await registerUser(data);
    } catch (error) {
      // If the server or the registration process runs into an error, show a popup alert to the user.
      alert("Signup failed.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-4 pt-20">
      <div className="card-minimal w-full max-w-lg rounded-2xl p-8">
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-black">Create Account</h1>
        <p className="mb-8 text-sm text-zinc-500">Join Staqed and start building today.</p>

        {/* 'handleSubmit' wraps our 'onSubmit' function to prevent the page from refreshing and to run validation first. */}
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-5 md:grid-cols-2">
          
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">First Name</label>
            <input 
              // The spread operator {...register('first_name')} links this specific input to React Hook Form's tracking logic.
              {...register('first_name')}
              className="input-minimal w-full rounded-lg px-4 py-3 text-sm text-black"
              placeholder="Jane"
            />
            {/* If there is a validation error for 'first_name', display the message in red text below the input. */}
            {errors.first_name && <p className="text-xs text-red-500">{errors.first_name.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Last Name</label>
            <input 
              // Connects this input to the 'last_name' validation and state management.
              {...register('last_name')}
              className="input-minimal w-full rounded-lg px-4 py-3 text-sm text-black"
              placeholder="Doe"
            />
            {/* If there is a validation error for 'last_name', display the error message. */}
            {errors.last_name && <p className="text-xs text-red-500">{errors.last_name.message}</p>}
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Email Address</label>
            <input 
              // Connects this input to the 'email' validation rules (including the format check).
              {...register('email')}
              type="email"
              className="input-minimal w-full rounded-lg px-4 py-3 text-sm text-black"
              placeholder="jane@example.com"
            />
            {/* If the email is invalid or missing, this shows the error message. */}
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Password</label>
            <input 
              // Connects this input to the 'password' validation rules (minimum 8 characters).
              {...register('password')}
              type="password"
              className="input-minimal w-full rounded-lg px-4 py-3 text-sm text-black"
              placeholder="••••••••"
            />
            {/* If the password is too short, the error message appears here. */}
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Confirm</label>
            <input 
              // Connects this input to 'password_confirm', which is checked against 'password' in our refine block above.
              {...register('password_confirm')}
              type="password"
              className="input-minimal w-full rounded-lg px-4 py-3 text-sm text-black"
              placeholder="••••••••"
            />
            {/* If the passwords do not match, the "Mismatch" error message is displayed here. */}
            {errors.password_confirm && <p className="text-xs text-red-500">{errors.password_confirm.message}</p>}
          </div>

          <button 
            type="submit"
            // If the form is currently being processed (isSubmitting is true), we disable the button to prevent double clicks.
            disabled={isSubmitting}
            className="w-full rounded-lg bg-black py-4 text-sm font-bold text-white transition-all hover:bg-zinc-800 disabled:opacity-50 md:col-span-2"
          >
            {/* If the form is submitting, show a "loading" message; otherwise, show the default "Sign Up" text. */}
            {isSubmitting ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-zinc-500">
          Already have an account?{' '}
          {/* A Next.js Link that allows the user to go to the login page without a full page reload. */}
          <Link href="/login" className="font-bold text-black hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}