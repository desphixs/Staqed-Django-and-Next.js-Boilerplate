import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext"; // Import our Auth Provider
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Staqed Boilerplate",
  description: "Ethereal Glassmorphism Boilerplate",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={inter.className}>
        {/* Background Blobs for the Glassmorphism effect */}
        <div className="bg-blob blob-purple"></div>
        <div className="bg-blob blob-cyan"></div>
        
        <AuthProvider>
          <Navbar />
          <main className="relative pt-32 min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
