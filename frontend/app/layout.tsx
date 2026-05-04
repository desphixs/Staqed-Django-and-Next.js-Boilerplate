// We import the 'Metadata' type from Next.js to help us define SEO rules for the website.
import type { Metadata } from "next";
// We import 'Inter' and 'Geist' fonts directly from Google Fonts using Next.js's built-in font system.
import { Inter, Geist } from "next/font/google";
// We import the global CSS file which contains all our site-wide styles and Tailwind configurations.
import "./globals.css";
// We import 'AuthProvider'—this is a "wrapper" that shares user login info with every component in the app.
import { AuthProvider } from "@/context/AuthContext"; 
// We import the 'Navbar' component so it can be displayed at the top of every page.
import Navbar from "@/components/Navbar";
// We import our ThemeProvider to handle light and dark mode automatically
import { ThemeProvider } from "@/components/ThemeProvider";
// 'cn' is a helper utility used to neatly combine different CSS class names together.
import { cn } from "@/lib/utils";

// Here we configure the 'Geist' font, setting it up as a CSS variable so we can use it throughout our styles.
const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

// Here we configure the 'Inter' font, which is a very popular and clean-looking font for web text.
const inter = Inter({ subsets: ["latin"] });

// This object tells search engines (like Google) what the title and description of your website are.
export const metadata: Metadata = {
  title: "Staqed Boilerplate",
  description: "Ethereal Glassmorphism Boilerplate",
};

// This is the main Layout function. It takes 'children' as a prop, which represents the content of the specific page you are visiting.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // We set the language to English and apply our custom 'Geist' font variable to the entire HTML structure.
    <html lang="en" className={cn("font-sans", geist.variable)}>
      {/* The body tag uses the 'Inter' font class to ensure all text on the site looks consistent. */}
      <body className={inter.className}>
        
        {/* ThemeProvider automatically adds the 'dark' class to html based on user preference */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* 
              'AuthProvider' wraps the entire app. This is crucial logic: it ensures that 
              no matter what page the user is on, the app knows if they are logged in or out.
          */}
          <AuthProvider>
            {/* Since the Navbar is inside the Layout but outside the 'main' tag, it stays fixed at the top. */}
            <Navbar />
            
            {/* 
                The 'main' tag is the container for your actual page content. 
                The '{children}' part is where the specific code for your Home, Login, or Register pages will be injected.
            */}
            <main className="relative pt-32 min-h-screen">
              {children}
            </main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}