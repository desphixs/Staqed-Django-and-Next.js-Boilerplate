'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import api from '@/lib/api';
import { toast } from 'sonner';

type Tab = 'general' | 'profile' | 'security';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/users/me/');
      setUser(response.data.data);
    } catch (err) {
      toast.error('Failed to load user settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const tabs = [
    { id: 'general', label: 'General', icon: <Settings size={18} /> },
    { id: 'profile', label: 'Profile Settings', icon: <User size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
  ];

  if (loading) {
    return (
      <DashboardWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
        </div>
      </DashboardWrapper>
    );
  }

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
          {activeTab === 'general' && <GeneralTab user={user} refresh={fetchUserData} />}
          {activeTab === 'profile' && <ProfileTab user={user} refresh={fetchUserData} />}
          {activeTab === 'security' && <SecurityTab />}
        </div>
      </div>
    </DashboardWrapper>
  );
}

function GeneralTab({ user, refresh }: { user: any; refresh: () => void }) {
  const handleToggle = async (field: string, value: boolean) => {
    try {
      await api.patch('/users/me/', {
        profile: {
          [field]: value
        }
      });
      toast.success('Preference updated');
      refresh();
    } catch (err) {
      toast.error('Failed to update preference');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <Section title="System Preferences" description="Configure how you interact with the platform.">
        <div className="space-y-4">
          <ToggleOption 
            title="Email Notifications" 
            description="Receive updates about your project activity and team mentions."
            icon={<Bell size={20} />}
            checked={user?.profile?.email_notifications}
            onChange={(checked: boolean) => handleToggle('email_notifications', checked)}
          />
          <ToggleOption 
            title="Public Profile" 
            description="Allow other users in your organization to see your activity."
            icon={<Globe size={20} />}
            checked={user?.profile?.public_profile}
            onChange={(checked: boolean) => handleToggle('public_profile', checked)}
          />
        </div>
      </Section>
    </div>
  );
}

function ProfileTab({ user, refresh }: { user: any; refresh: () => void }) {
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    bio: user?.profile?.bio || '',
  });
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdateProfile = async () => {
    setUpdating(true);
    try {
      await api.patch('/users/me/', {
        first_name: formData.first_name,
        last_name: formData.last_name,
        profile: {
          bio: formData.bio
        }
      });
      toast.success('Profile updated successfully!');
      refresh();
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append('profile_picture', file);

    try {
      await api.post('/users/me/photo/', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Profile picture updated!');
      refresh();
    } catch (err) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <Section title="Personal Information" description="Update your basic profile details.">
        <div className="flex flex-col gap-8 md:flex-row md:items-start">
          {/* Avatar Upload */}
          <div className="relative group">
            <div className="h-32 w-32 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-700 overflow-hidden relative">
              {user?.profile?.profile_picture ? (
                <img 
                  src={user.profile.profile_picture} 
                  alt="Avatar" 
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-3xl font-black text-zinc-400">
                  {user?.first_name?.[0] || 'U'}
                </span>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-black dark:bg-white text-white dark:text-black shadow-lg border-2 border-white dark:border-zinc-950 transition-transform hover:scale-110 disabled:opacity-50"
            >
              <Camera size={16} />
            </button>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup 
              label="First Name" 
              value={formData.first_name} 
              onChange={(e: any) => setFormData({ ...formData, first_name: e.target.value })}
            />
            <InputGroup 
              label="Last Name" 
              value={formData.last_name} 
              onChange={(e: any) => setFormData({ ...formData, last_name: e.target.value })}
            />
            <InputGroup label="Email" value={user?.email} icon={<Mail size={16} />} disabled />
            <div className="md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Biography</label>
              <textarea 
                value={formData.bio}
                onChange={(e: any) => setFormData({ ...formData, bio: e.target.value })}
                className="mt-2 w-full min-h-[100px] rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 text-sm transition-all focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleUpdateProfile}
            disabled={updating}
            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-black dark:bg-white text-white dark:text-black text-sm font-bold hover:shadow-xl transition-all disabled:opacity-50"
          >
            {updating && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>}
            {updating ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </Section>
    </div>
  );
}

function SecurityTab() {
  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [updating, setUpdating] = useState(false);

  const handleUpdatePassword = async () => {
    if (passwords.new_password !== passwords.confirm_password) {
      toast.error("New passwords do not match.");
      return;
    }

    setUpdating(true);
    try {
      await api.post('/users/password-change/', {
        old_password: passwords.old_password,
        new_password: passwords.new_password,
        new_password_confirm: passwords.confirm_password
      });
      toast.success("Password updated successfully!");
      setPasswords({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData) {
        // Display specific field errors if they exist
        Object.keys(errorData).forEach(key => {
          if (Array.isArray(errorData[key])) {
            errorData[key].forEach((msg: string) => toast.error(`${key}: ${msg}`));
          } else {
            toast.error(errorData[key]);
          }
        });
      } else {
        toast.error("Failed to update password.");
      }
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <Section title="Password" description="Change your password regularly to keep your account secure.">
        <div className="max-w-md space-y-4">
          <InputGroup 
            label="Current Password" 
            type="password" 
            icon={<Lock size={16} />} 
            value={passwords.old_password}
            onChange={(e: any) => setPasswords({ ...passwords, old_password: e.target.value })}
          />
          <InputGroup 
            label="New Password" 
            type="password" 
            icon={<Lock size={16} />} 
            value={passwords.new_password}
            onChange={(e: any) => setPasswords({ ...passwords, new_password: e.target.value })}
          />
          <InputGroup 
            label="Confirm New Password" 
            type="password" 
            icon={<Lock size={16} />} 
            value={passwords.confirm_password}
            onChange={(e: any) => setPasswords({ ...passwords, confirm_password: e.target.value })}
          />
          <button 
            onClick={handleUpdatePassword}
            disabled={updating}
            className="mt-2 w-full px-6 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {updating && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>}
            {updating ? 'Updating...' : 'Update Password'}
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

function InputGroup({ label, value, onChange, placeholder, icon, type = "text", disabled = false }: any) {
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
          value={value || ''}
          onChange={onChange}
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

function ToggleOption({ title, description, icon, checked, onChange }: any) {
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
        <input 
          type="checkbox" 
          className="sr-only peer" 
          checked={checked} 
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-black dark:peer-checked:bg-white dark:peer-checked:after:bg-black"></div>
      </label>
    </div>
  );
}
