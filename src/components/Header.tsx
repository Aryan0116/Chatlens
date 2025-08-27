import { Button } from "@/components/ui/button";
import { Moon, Sun, User } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-chatLens-purple via-purple-600 to-chatLens-blue rounded-xl p-2.5 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <svg 
              width="22" 
              height="22" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-sm"
            >
              <path 
                d="M21 11.5C21 16.1944 16.9706 20 12 20C10.5125 20 9.1151 19.6573 7.9 19.0518L3 20L4.3 16.3C3.4 14.9 3 13.3 3 11.5C3 6.8056 7.0294 3 12 3C16.9706 3 21 6.8056 21 11.5Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              Chat<span className="bg-gradient-to-r from-chatLens-purple to-chatLens-blue bg-clip-text text-transparent">Lens</span>
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              AI-Powered Conversations
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Contact/Developer Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("https://aryan-singh16.vercel.app/", "_blank", "noopener,noreferrer")}
            className="hidden sm:flex items-center gap-2 rounded-full border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
            aria-label="Contact Developer"
          >
            <User className="h-4 w-4" />
            <span className="font-medium">Developer</span>
          </Button>
          
          {/* Mobile Contact Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => window.open("https://aryan-singh16.vercel.app/", "_blank", "noopener,noreferrer")}
            className="sm:hidden rounded-full border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
            aria-label="Contact Developer"
          >
            <User className="h-4 w-4" />
          </Button>
          
          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4 transition-transform duration-200 hover:rotate-12" />
            ) : (
              <Sun className="h-4 w-4 transition-transform duration-200 hover:rotate-12" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}