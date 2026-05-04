'use client';

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu, LayoutDashboard, Settings, LogOut, ChevronLeft, 
  Moon, Sun, Milestone, Users, User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import Logo from "@/components/Logo";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface DashboardWrapperProps {
  children: React.ReactNode;
}

export default function DashboardWrapper({ children }: DashboardWrapperProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const navItems = useMemo(() => [
    { label: "Overview", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "Profile", href: "/dashboard/profile", icon: <User size={20} /> },
    { label: "Projects", href: "/dashboard/projects", icon: <Milestone size={20} /> },
    { label: "Team", href: "/dashboard/team", icon: <Users size={20} /> },
  ], []);

  const footerItems = useMemo(() => [
    { label: "Settings", href: "/dashboard/settings", icon: <Settings size={20} /> },
  ], []);

  return (
    <div className="flex min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
      {/* DESKTOP SIDEBAR */}
      <aside
        className={cn(
          "hidden lg:flex flex-col sticky top-0 h-screen border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 transition-all duration-300 overflow-hidden",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-inherit">
          {isSidebarOpen && <Logo />}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-zinc-500"
          >
            <ChevronLeft className={cn("transition-transform duration-300", !isSidebarOpen && "rotate-180")} size={20} />
          </Button>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => (
            <NavItem 
              key={item.href} 
              {...item} 
              active={pathname === item.href} 
              isCollapsed={!isSidebarOpen} 
            />
          ))}
        </nav>

        <div className="p-3 border-t border-inherit space-y-1">
          {footerItems.map((item) => (
            <NavItem 
              key={item.href} 
              {...item} 
              active={pathname === item.href} 
              isCollapsed={!isSidebarOpen} 
            />
          ))}
          
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-zinc-500 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-all"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            {isSidebarOpen && <span>Theme</span>}
          </button>

          <button 
            onClick={logout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            {/* MOBILE TRIGGER */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-zinc-500">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
                <div className="h-16 flex items-center px-6 border-b border-inherit">
                  <Logo />
                </div>
                <div className="py-6 px-3 space-y-1">
                  {navItems.map((item) => (
                    <NavItem key={item.href} {...item} active={pathname === item.href} />
                  ))}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-inherit bg-inherit">
                  {footerItems.map((item) => (
                    <NavItem key={item.href} {...item} active={pathname === item.href} />
                  ))}
                  <button 
                    onClick={logout}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </div>
              </SheetContent>
            </Sheet>
            
            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Workspace</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Destiny Frank</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Pro Plan</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-sm shadow-lg">
              DF
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavItem({ icon, label, href, active, isCollapsed }: any) {
  return (
    <Link 
      href={href} 
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all group relative", 
        active 
          ? "bg-black dark:bg-white text-white dark:text-black shadow-md" 
          : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
      )}
    >
      <span className={cn("shrink-0", active ? "text-inherit" : "group-hover:text-black dark:group-hover:text-white")}>
        {icon}
      </span>
      {!isCollapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}
