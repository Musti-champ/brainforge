import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Puzzle, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["/api/users/user-1"],
  });

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Puzzle className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold text-gray-900">API Puzzle Quest</h1>
            </div>
            <span className="bg-accent/10 text-accent text-xs font-medium px-2 py-1 rounded-full">Beta</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-700 hover:text-primary font-medium" data-testid="nav-challenges">Challenges</a>
            <a href="#" className="text-gray-700 hover:text-primary font-medium" data-testid="nav-leaderboard">Leaderboard</a>
            <a href="#" className="text-gray-700 hover:text-primary font-medium" data-testid="nav-collections">Collections</a>
            <a href="#" className="text-gray-700 hover:text-primary font-medium" data-testid="nav-docs">Docs</a>
          </nav>

          <div className="flex items-center space-x-4">
            {user && (
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900" data-testid="user-level">Level {user.level}</div>
                  <div className="text-xs text-gray-500" data-testid="user-xp">{user.xp.toLocaleString()} XP</div>
                </div>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold" data-testid="user-avatar">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            )}
            
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" data-testid="mobile-menu-trigger">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col space-y-4 mt-8">
                  <a href="#" className="text-gray-700 hover:text-primary font-medium" data-testid="mobile-nav-challenges">Challenges</a>
                  <a href="#" className="text-gray-700 hover:text-primary font-medium" data-testid="mobile-nav-leaderboard">Leaderboard</a>
                  <a href="#" className="text-gray-700 hover:text-primary font-medium" data-testid="mobile-nav-collections">Collections</a>
                  <a href="#" className="text-gray-700 hover:text-primary font-medium" data-testid="mobile-nav-docs">Docs</a>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
