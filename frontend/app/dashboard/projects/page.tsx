'use client';

import React from 'react';
import DashboardWrapper from '@/components/dashboard/DashboardWrapper';
import { Layers } from 'lucide-react';

export default function ProjectsPage() {
  return (
    <DashboardWrapper>
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="h-20 w-20 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
          <Layers size={40} />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black dark:text-white">Projects</h1>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-md">
            Manage your SaaS projects and deployments from this centralized hub. 
            Integration with GitHub and Vercel coming soon.
          </p>
        </div>
      </div>
    </DashboardWrapper>
  );
}
