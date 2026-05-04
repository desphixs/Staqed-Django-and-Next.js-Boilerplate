import React from 'react';
import { Shield } from 'lucide-react';
import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black dark:bg-white text-white dark:text-black transition-transform group-hover:scale-110">
        <Shield className="h-5 w-5" />
      </div>
      <span className="text-xl font-bold tracking-tight text-black dark:text-white">
        STAQED
      </span>
    </Link>
  );
}
