"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Home,
  Search,
  Users,
  Calendar,
  MessageSquare,
  User,
  Sun,
  Moon,
  Plus,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  LogIn,
  UserPlus,
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  badgeCount?: number;
  requiresAuth?: boolean;
}

interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface NavBarProps {
  activeItem?: string;
  onNavigate?: (itemId: string) => void;
  className?: string;
  user?: AuthUser | null;
}

const navItems: NavItem[] = [
  { id: "home", label: "Home", icon: Home, href: "/" },
  { id: "search", label: "Search", icon: Search, href: "/search" },
  { id: "social", label: "Social", icon: Users, href: "/social" },
  { id: "bookings", label: "Bookings", icon: Calendar, href: "/bookings", badgeCount: 3, requiresAuth: true },
  { id: "messages", label: "Messages", icon: MessageSquare, href: "/messages", badgeCount: 5, requiresAuth: true },
  { id: "profile", label: "Profile", icon: User, href: "/profile", requiresAuth: true },
];

export default function NavBar({ activeItem = "home", onNavigate, className, user }: NavBarProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const { refetch } = useSession();

  // Initialize theme from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.classList.toggle("dark", savedTheme === "dark");
      }
    }
  }, []);

  // Handle theme toggle
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newTheme);
      document.documentElement.classList.toggle("dark", newTheme === "dark");
    }
  };

  // Handle global search shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandOpen(true);
      }
    };

    if (typeof window !== "undefined") {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, []);

  const handleNavItemClick = (itemId: string) => {
    const item = navItems.find(nav => nav.id === itemId);
    
    // Check if item requires authentication
    if (item?.requiresAuth && !user) {
      router.push("/login");
      return;
    }

    if (onNavigate) {
      onNavigate(itemId);
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await authClient.signOut();
      if (error?.code) {
        toast.error("Failed to sign out. Please try again.");
      } else {
        localStorage.removeItem("bearer_token");
        // Refresh session state instead of full page reload
        await refetch();
        toast.success("Successfully signed out!");
        router.push("/");
      }
    } catch (error) {
      toast.error("An error occurred while signing out.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const NavItemButton = ({ item, isActive, showLabel = true }: { item: NavItem; isActive: boolean; showLabel?: boolean }) => (
    <Button
      variant={isActive ? "default" : "ghost"}
      size="sm"
      className={`
        relative flex items-center justify-center gap-2 transition-all
        ${showLabel ? "px-4 py-2" : "p-2 w-12 h-12"}
        ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}
        ${item.requiresAuth && !user ? "opacity-60" : ""}
      `}
      onClick={() => handleNavItemClick(item.id)}
      aria-label={item.label}
      title={item.requiresAuth && !user ? "Sign in required" : item.label}
    >
      <item.icon className={`h-5 w-5 ${showLabel ? "" : "h-6 w-6"}`} />
      {showLabel && <span className="text-sm font-medium">{item.label}</span>}
      {item.badgeCount && item.badgeCount > 0 && user && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
        >
          {item.badgeCount > 9 ? "9+" : item.badgeCount}
        </Badge>
      )}
    </Button>
  );

  const AuthButtons = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex items-center ${mobile ? "flex-col space-y-2" : "space-x-2"}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/login")}
        className="text-muted-foreground hover:text-foreground"
      >
        <LogIn className="h-4 w-4 mr-2" />
        Sign In
      </Button>
      <Button
        size="sm"
        onClick={() => router.push("/register")}
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Sign Up
      </Button>
    </div>
  );

  const UserProfile = ({ mobile = false }: { mobile?: boolean }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`relative ${mobile ? "p-2 w-12 h-12" : "h-8 w-8"} rounded-full`}>
          <Avatar className={mobile ? "h-6 w-6" : "h-8 w-8"}>
            <AvatarImage src={user?.image} alt={user?.name || "Profile"} />
            <AvatarFallback className={mobile ? "text-xs" : ""}>
              {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" side={mobile ? "top" : "bottom"} forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{user?.name}</p>
            <p className="w-[200px] truncate text-sm text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleNavItemClick("profile")}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoggingOut ? "Signing out..." : "Sign out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <TooltipProvider>
      <nav
        role="navigation"
        aria-label="Main navigation"
        className={`bg-card border-b border-border ${className}`}
      >
        {/* Desktop Navigation */}
        <div className="hidden md:block">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo/Brand */}
              <div className="flex items-center">
                <button 
                  onClick={() => handleNavItemClick("home")}
                  className="text-xl font-bold text-foreground hover:text-primary transition-colors"
                >
                  Rent My Life
                </button>
              </div>

              {/* Main Navigation */}
              <div className="flex items-center space-x-2">
                {navItems.map((item) => (
                  <NavItemButton
                    key={item.id}
                    item={item}
                    isActive={activeItem === item.id}
                  />
                ))}
              </div>

              {/* Right Actions */}
              <div className="flex items-center space-x-2">
                {/* Global Search */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsCommandOpen(true)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Search className="h-5 w-5" />
                      <span className="ml-2 text-sm">Search</span>
                      <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground opacity-100">
                        <span className="text-xs">⌘</span>K
                      </kbd>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Global search (⌘K)</TooltipContent>
                </Tooltip>

                {/* Theme Toggle */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleTheme}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {theme === "light" ? (
                        <Sun className="h-5 w-5" />
                      ) : (
                        <Moon className="h-5 w-5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Toggle theme</TooltipContent>
                </Tooltip>

                {/* Authentication */}
                {user ? <UserProfile /> : <AuthButtons />}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          {/* Top Bar */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-border">
            <button 
              onClick={() => handleNavItemClick("home")}
              className="text-lg font-bold text-foreground hover:text-primary transition-colors"
            >
              Rent My Life
            </button>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="text-muted-foreground hover:text-foreground"
              >
                {theme === "light" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-muted-foreground hover:text-foreground"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <div className="absolute top-16 left-0 right-0 bg-card border-b border-border shadow-lg z-50">
              <div className="p-4 space-y-2">
                {navItems.map((item) => (
                  <NavItemButton
                    key={item.id}
                    item={item}
                    isActive={activeItem === item.id}
                  />
                ))}
                {!user && (
                  <div className="pt-4 mt-4 border-t border-border">
                    <AuthButtons mobile />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation (Mobile) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
          <div className="flex items-center justify-around px-2 py-2">
            {navItems.slice(0, 2).map((item) => (
              <NavItemButton
                key={item.id}
                item={item}
                isActive={activeItem === item.id}
                showLabel={false}
              />
            ))}
            
            {/* Create Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  className="rounded-full w-12 h-12 bg-primary text-primary-foreground shadow-lg"
                  onClick={() => user ? handleNavItemClick("social") : router.push("/login")}
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{user ? "Create" : "Sign in to create"}</TooltipContent>
            </Tooltip>

            {navItems.slice(2, 4).map((item) => (
              <NavItemButton
                key={item.id}
                item={item}
                isActive={activeItem === item.id}
                showLabel={false}
              />
            ))}

            {/* Profile in bottom nav */}
            {user ? (
              <UserProfile mobile />
            ) : (
              <Button
                variant="ghost"
                className="p-2 w-12 h-12"
                onClick={() => router.push("/login")}
              >
                <LogIn className="h-6 w-6" />
              </Button>
            )}
          </div>
        </div>

        {/* Global Search Command Palette */}
        <CommandDialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Navigation">
              {navItems.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => {
                    handleNavItemClick(item.id);
                    setIsCommandOpen(false);
                  }}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            {user && (
              <CommandGroup heading="Quick Actions">
                <CommandItem>
                  <Plus className="mr-2 h-4 w-4" />
                  <span>Create new post</span>
                </CommandItem>
                <CommandItem>
                  <Plus className="mr-2 h-4 w-4" />
                  <span>Create new listing</span>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </CommandDialog>
      </nav>
    </TooltipProvider>
  );
}