import { Button } from "./ui/button";
import { LogIn, UserPlus, Menu, X, Users } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  onNavigate: (section: 'home' | 'upload' | 'recents' | 'demo' | 'team') => void;
  activeSection: 'home' | 'upload' | 'recents' | 'demo' | 'team';
  onLogin: () => void;
  onSignUp: () => void;
}

export function Header({ onNavigate, activeSection, onLogin, onSignUp }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { key: 'home' as const, label: 'Home' },
    { key: 'demo' as const, label: 'Demo' },
    { key: 'upload' as const, label: 'Upload' },
    { key: 'recents' as const, label: 'My Deadlines' },
    { key: 'team' as const, label: 'Team', icon: Users },
  ];

  return (
    <header className="relative z-50 w-full border-b border-white/20 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  RushiGo
                </span>
                <p className="text-xs text-gray-500 -mt-1">AI Deadline Tracker</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.key}
                variant={activeSection === item.key ? 'default' : 'ghost'}
                onClick={() => onNavigate(item.key)}
                className={`${
                  activeSection === item.key 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700' 
                    : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                {item.icon && <item.icon className="h-4 w-4 mr-2" />}
                {item.label}
              </Button>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Button
              variant="ghost"
              onClick={onLogin}
              className="text-gray-700 hover:text-purple-600 hover:bg-purple-50"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Button>
            <Button
              onClick={onSignUp}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Sign Up
            </Button>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Button
                  key={item.key}
                  variant={activeSection === item.key ? 'default' : 'ghost'}
                  onClick={() => {
                    onNavigate(item.key);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`justify-start ${
                    activeSection === item.key 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                      : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  {item.icon && <item.icon className="h-4 w-4 mr-2" />}
                  {item.label}
                </Button>
              ))}
              
              {/* Mobile Auth Buttons */}
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    onLogin();
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start w-full text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
                <Button
                  onClick={() => {
                    onSignUp();
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}