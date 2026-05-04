'use client';

import React, { useState } from 'react';
import DashboardWrapper from '@/components/dashboard/DashboardWrapper';
import { 
  User, 
  Settings, 
  Shield, 
  Bell, 
  Trash2,
  Camera,
  Mail,
  Phone,
  Lock,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'general' | 'profile' | 'security';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('general');

  const tabs = [
    { id: 'general', label: 'General', icon: <Settings size={18} /> },
    { id: 'profile', label: 'Profile Settings', icon: <User size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
  ];

  return (
    <DashboardWrapper>
      <div className="max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">Settings</h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            Manage your account settings and preferences.
          </p>
        </div>

        {/* TABS */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={cn(
                "flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all",
                activeTab === tab.id 
                  ? "border-black dark:border-white text-black dark:text-white" 
                  : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        <div className="py-4">
          {activeTab === 'general' && <GeneralTab />}
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'security' && <SecurityTab />}
        </div>
      </div>
    </DashboardWrapper>
  );
}

function GeneralTab() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <Section title="System Preferences" description="Configure how you interact with the platform.">
        <div className="space-y-4">
          <ToggleOption 
            title="Email Notifications" 
            description="Receive updates about your project activity and team mentions."
            icon={<Bell size={20} />}
            defaultChecked
          />
          <ToggleOption 
            title="Public Profile" 
            description="Allow other users in your organization to see your activity."
            icon={<Globe size={20} />}
          />
        </div>
      </Section>

      <Section title="Danger Zone" description="Irreversible actions for your account.">
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/10 transition-all">
          <Trash2 size={18} />
          Delete Account
        </button>
      </Section>
    </div>
  );
}

function ProfileTab() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <Section title="Personal Information" description="Update your basic profile details.">
        <div className="flex flex-col gap-8 md:flex-row md:items-start">
          {/* Avatar Upload */}
          <div className="relative group">
            <div className="h-32 w-32 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-700 overflow-hidden">
              <span className="text-3xl font-black text-zinc-400">
                DF
              </span>
            </div>
            <button className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-black dark:bg-white text-white dark:text-black shadow-lg border-2 border-white dark:border-zinc-950 transition-transform hover:scale-110">
              <Camera size={16} />
            </button>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup label="First Name" value="Destiny" />
            <InputGroup label="Last Name" value="Frank" />
            <InputGroup label="Email" value="destiny@example.com" icon={<Mail size={16} />} disabled />
            <InputGroup label="Phone Number" placeholder="+1 (555) 000-0000" icon={<Phone size={16} />} />
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <button className="px-8 py-3 rounded-2xl bg-black dark:bg-white text-white dark:text-black text-sm font-bold hover:shadow-xl transition-all">
            Save Changes
          </button>
        </div>
      </Section>
    </div>
  );
}

function SecurityTab() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <Section title="Password" description="Change your password regularly to keep your account secure.">
        <div className="max-w-md space-y-4">
          <InputGroup label="Current Password" type="password" icon={<Lock size={16} />} />
          <InputGroup label="New Password" type="password" icon={<Lock size={16} />} />
          <InputGroup label="Confirm New Password" type="password" icon={<Lock size={16} />} />
          <button className="mt-2 w-full px-6 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all">
            Update Password
          </button>
        </div>
      </Section>

    </div>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="pb-4 border-b border-zinc-100 dark:border-zinc-900">
        <h3 className="text-lg font-bold text-black dark:text-white">{title}</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>
      <div className="pt-2">{children}</div>
    </div>
  );
}

function InputGroup({ label, value, placeholder, icon, type = "text", disabled = false }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{label}</label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
            {icon}
          </div>
        )}
        <input 
          type={type}
          defaultValue={value}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-3 text-sm transition-all focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none",
            icon ? "pl-11 pr-4" : "px-4",
            disabled && "opacity-50 cursor-not-allowed bg-zinc-50 dark:bg-zinc-900"
          )}
        />
      </div>
    </div>
  );
}

function ToggleOption({ title, description, icon, defaultChecked }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-zinc-100 dark:border-zinc-900 hover:border-zinc-200 dark:hover:border-zinc-800 transition-all">
      <div className="flex gap-4">
        <div className="text-zinc-400">{icon}</div>
        <div>
          <p className="text-sm font-bold text-black dark:text-white">{title}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" defaultChecked={defaultChecked} />
        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-black dark:peer-checked:bg-white dark:peer-checked:after:bg-black"></div>
      </label>
    </div>
  );
}
