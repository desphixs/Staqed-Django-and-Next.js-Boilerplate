'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User as UserIcon, Settings, LayoutDashboard } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import Logo from './Logo';

// Import Shadcn components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [mounted, setMounted] = React.useState(false); // Fix hydration mismatch

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Create initials for the avatar fallback (e.g., "John Doe" -> "JD")
  const getInitials = () => {
    if (!user) return "??";
    const first = user.first_name?.[0] || "";
    const last = user.last_name?.[0] || "";
    return (first + last).toUpperCase() || user.email[0].toUpperCase();
  };

  // If not mounted, render a placeholder to avoid hydration mismatch
  if (!mounted) return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Logo />
      </div>
    </nav>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        
        {/* Brand Logo */}
        <Logo />

        {/* Links & Auth State */}
        <div className="flex items-center gap-8">
          
          {/* ThemeToggle shown outside for guests only */}
          {!isAuthenticated && <ThemeToggle />}
          
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none">
                  <Avatar className="h-9 w-9 border border-zinc-200 transition-opacity hover:opacity-80">
                    <AvatarImage src={user?.profile_picture} alt={user?.first_name} />
                    <AvatarFallback className="bg-zinc-100 text-xs font-bold text-zinc-600">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 shadow-xl border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950">
                  <DropdownMenuGroup> {/* This Group wrapper fixes the Base UI error */}
                    <DropdownMenuLabel className="p-2 font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-bold leading-none text-black dark:text-white">
                          {user?.first_name} {user?.last_name}
                        </p>
                        <p className="text-xs leading-none text-zinc-500">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />
                  
                  <Link href="/dashboard" className="w-full">
                    <DropdownMenuItem className="cursor-pointer rounded-lg p-2 focus:bg-zinc-100 dark:focus:bg-zinc-800 focus:text-black dark:focus:text-white">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                  </Link>

                  <Link href="/dashboard/profile" className="w-full">
                    <DropdownMenuItem className="cursor-pointer rounded-lg p-2 focus:bg-zinc-100 dark:focus:bg-zinc-800 focus:text-black dark:focus:text-white">
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  
                  <Link href="/dashboard/settings" className="w-full">
                    <DropdownMenuItem className="cursor-pointer rounded-lg p-2 focus:bg-zinc-100 dark:focus:bg-zinc-800 focus:text-black dark:focus:text-white">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </Link>
                  
                  <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />
                  
                  <DropdownMenuItem 
                    onClick={logout}
                    className="cursor-pointer rounded-lg p-2 text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />
                  
                  {/* ThemeToggle inside dropdown for logged-in users */}
                  <div className="flex items-center justify-between p-2">
                    <span className="text-xs font-medium text-zinc-500">Theme</span>
                    <ThemeToggle />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white">
                Login
              </Link>
              <Link 
                href="/register" 
                className="rounded-lg bg-black dark:bg-white px-4 py-2 text-sm font-bold text-white dark:text-black transition-all hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-95"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
