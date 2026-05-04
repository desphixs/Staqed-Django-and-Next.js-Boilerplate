import DashboardWrapper from '@/components/dashboard/DashboardWrapper';

export default function DashboardPage() {
  return (
    <DashboardWrapper>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">
            Dashboard Overview
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            Welcome back, Destiny. Monitor your SaaS performance and projects.
          </p>
        </div>

        
        <div className="border border-dashed h-50 rounded-lg flex justify-center items-center">
          <p className='pt-1 text-sm text-zinc-500 dark:text-zinc-400'>Welcome to the Dashboard</p>
        </div>
      </div>
    </DashboardWrapper>
  );
}


