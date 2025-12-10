import React, { useState } from "react";
import { Menu, X, Bot, Zap, Globe, Shield, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const navItems = [
    { name: "Features", href: "#features", icon: Zap },
    { name: "Pricing", href: "#pricing", icon: Shield },
    { name: "Docs/FAQ", href: "#faq", icon: Globe },
    { name: "Community", href: "#community", icon: Bot },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="relative">
              <Bot className="h-8 w-8 text-primary" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full pulse-dot"></div>
            </div>
            <span className="text-xl font-bold gradient-text">ShadowTalk AI</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  if (item.name === "Pricing") {
                    navigate('/pricing');
                  } else {
                    document.getElementById(item.href.substring(1))?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </button>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/auth')}
            >
              Login
            </Button>
            <Button
              size="sm"
              className="btn-glow"
              onClick={() => navigate('/chatbot')}
            >
              Try Free
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-foreground"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b border-border">
            <div className="px-4 py-6 space-y-6">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    if (item.name === "Pricing") {
                      navigate('/pricing');
                    } else {
                      document.getElementById(item.href.substring(1))?.scrollIntoView({ behavior: 'smooth' });
                    }
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 text-muted-foreground hover:text-primary transition-colors w-full text-left"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </button>
              ))}
              <div className="flex flex-col space-y-3 pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="justify-start"
                >
                  {theme === "dark" ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigate('/auth');
                    setIsMenuOpen(false);
                  }}
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  className="btn-glow"
                  onClick={() => {
                    navigate('/chatbot');
                    setIsMenuOpen(false);
                  }}
                >
                  Try Free
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
