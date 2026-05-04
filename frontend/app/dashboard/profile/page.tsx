import DashboardWrapper from '@/components/dashboard/DashboardWrapper';
import { Edit3, } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {

  return (
    <DashboardWrapper>
      <div className="w-full space-y-8">
        {/* HEADER / COVER AREA */}
        <div className="relative h-64 w-full rounded-3xl bg-gradient-to-r from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 overflow-hidden">
           <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_1px_1px,_var(--tw-gradient-from)_1px,_transparent_0)] bg-[size:24px_24px]"></div>
        </div>

        {/* PROFILE INFO */}
        <div className="relative -mt-20 px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col md:flex-row items-end gap-6">
              <div className="h-40 w-40 rounded-3xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-5xl font-black border-8 border-white dark:border-zinc-950 shadow-2xl">
                DF
              </div>
              <div className="pb-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-black tracking-tight text-black dark:text-white">
                    Destiny Frank
                  </h1>
                  <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    Pro
                  </span>
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium">@destiny_frank</p>
              </div>
            </div>
            
            <Link 
              href="/dashboard/settings" 
              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black text-sm font-bold shadow-xl transition-all hover:scale-105"
            >
              <Edit3 size={16} />
              Edit Profile
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* ABOUT / BIO */}
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-black dark:text-white">Professional Bio</h2>
                <p className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-3xl">
                  Product Designer and Software Architect focused on building high-performance SaaS applications. I specialize in bridging the gap between design and engineering to create seamless user experiences.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardWrapper>
  );
}
