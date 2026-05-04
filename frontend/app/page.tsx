'use client';

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { ArrowRight, Terminal, Code, Cpu, Globe, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <>
      <Navbar />
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pt-32">
      
      {/* Subtle Background Grid */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <div className="mx-auto max-w-7xl px-6 py-20 text-center">
        
        {/* Badge */}
        <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 backdrop-blur-sm">
          <Terminal size={14} className="text-black dark:text-white" />
          Staqed v1.0 • Now with RawAxys
        </div>
        
        {/* Hero Title */}
        <h1 className="mx-auto mb-8 max-w-4xl text-6xl font-[900] leading-[1.1] tracking-tight text-black dark:text-white md:text-6xl">
          Everything you need <br />
          <span className="text-zinc-300 dark:text-zinc-700">to ship in 24 hours.</span>
        </h1>
        
        {/* Subtitle */}
        <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-zinc-500 dark:text-zinc-400 md:text-xl">
          A high-performance Django + Next.js core. Secure JWT auth, 
          Shadcn/UI components, and a developer experience that feels like magic.
        </p>

        {/* Action Buttons */}
        <div className="mb-20 flex flex-wrap items-center justify-center gap-4">
          {isAuthenticated ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm font-medium text-zinc-400">
                You are currently logged in as <span className="text-black dark:text-white font-bold">{user?.email}</span>
              </p>
              <Link 
                href="/"
                className="flex items-center gap-2 rounded-xl bg-black dark:bg-white px-8 py-4 text-sm font-bold text-white dark:text-black shadow-xl shadow-zinc-200 dark:shadow-none transition-all hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-95"
              >
                Go to Dashboard
                <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            <>
              <Link 
                href="/register"
                className="flex items-center gap-2 rounded-xl bg-black dark:bg-white px-8 py-4 text-sm font-bold text-white dark:text-black shadow-xl shadow-zinc-200 dark:shadow-none transition-all hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-95"
              >
                Get the Boilerplate
                <ArrowRight size={18} />
              </Link>
              <Link 
                href="https://github.com"
                className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black px-8 py-4 text-sm font-bold text-black dark:text-white transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                <Code size={18} />
                Star on GitHub
              </Link>
            </>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
