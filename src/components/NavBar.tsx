"use client";

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authClient, useSession } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Bell,
  Home,
  MessageSquare,
  Calendar,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X
} from "lucide-react"
import { toast } from "sonner"

interface NavigationBarProps {
  activeSection?: string
  onSectionChange?: (section: string) => void
}

const navigationItems = [
  { id: "home", label: "Home", icon: Home, requiresAuth: false },
  { id: "search", label: "Search", icon: Search, requiresAuth: false },
  { id: "messages", label: "Messages", icon: MessageSquare, requiresAuth: true },
  { id: "bookings", label: "Bookings", icon: Calendar, requiresAuth: true },
  { id: "profile", label: "Profile", icon: User, requiresAuth: true },
]

export const NavigationBar = ({ activeSection = "home", onSectionChange }: NavigationBarProps) => {
  const { data: session, isPending, refetch } = useSession()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [notificationCount] = useState(3) // Mock notification count

  const user = session?.user

  const handleSectionChange = useCallback((section: string) => {
    const item = navigationItems.find(item => item.id === section)
    
    if (item?.requiresAuth && !user) {
      toast.error("Please sign in to access this feature")
      router.push("/login")
      return
    }

    onSectionChange?.(section)
    setIsMobileMenuOpen(false)
  }, [user, router, onSectionChange])

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Implement search functionality
      handleSectionChange("search")
      // You can pass search query to parent or handle search logic here
    }
  }, [searchQuery, handleSectionChange])

  const handleSignOut = async () => {
    try {
      const { error } = await authClient.signOut()
      if (error?.code) {
        toast.error("Sign out failed: " + error.code)
      } else {
        localStorage.removeItem("bearer_token")
        refetch() // Update session state
        toast.success("Signed out successfully")
        router.push("/")
        // Force a page reload to ensure all state is cleared
        setTimeout(() => {
          window.location.reload()
        }, 100)
      }
    } catch (error) {
      console.error("Sign out error:", error)
      toast.error("Sign out failed")
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const filteredNavigationItems = navigationItems.filter(item => 
    !item.requiresAuth || user
  )

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="font-bold text-xl bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
            Rent My Life
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {filteredNavigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => handleSectionChange(item.id)}
                className={`flex items-center space-x-2 transition-all duration-200 ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden lg:inline">{item.label}</span>
              </Button>
            )
          })}
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-4 hidden sm:block">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search experiences, users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className={`pl-10 pr-4 transition-all duration-200 ${
                isSearchFocused 
                  ? "ring-2 ring-ring ring-offset-2" 
                  : "focus:ring-2 focus:ring-ring focus:ring-offset-2"
              }`}
            />
          </form>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2">
          {/* Show loading state if pending */}
          {isPending ? (
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
            </div>
          ) : user ? (
            <>
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-4 w-4" />
                    {notificationCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {notificationCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex flex-col items-start space-y-1 p-3">
                    <div className="font-medium">New booking request</div>
                    <div className="text-sm text-muted-foreground">
                      Someone wants to book your photography session
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start space-y-1 p-3">
                    <div className="font-medium">Payment received</div>
                    <div className="text-sm text-muted-foreground">
                      Your recent booking has been paid
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start space-y-1 p-3">
                    <div className="font-medium">New follower</div>
                    <div className="text-sm text-muted-foreground">
                      John Doe started following you
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name || user.email || "U")}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleSectionChange("profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/help")}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push("/login")}
                className="hidden sm:flex"
              >
                Sign In
              </Button>
              <Button 
                size="sm"
                onClick={() => router.push("/register")}
              >
                Sign Up
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container py-4 space-y-2">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search experiences, users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
              />
            </form>

            {/* Mobile Navigation Items */}
            {filteredNavigationItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleSectionChange(item.id)}
                  className={`w-full justify-start space-x-2 ${
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              )
            })}

            {/* Mobile Auth Buttons */}
            {!user && !isPending && (
              <div className="pt-4 border-t space-y-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push("/login")}
                  className="w-full justify-start"
                >
                  Sign In
                </Button>
                <Button 
                  size="sm"
                  onClick={() => router.push("/register")}
                  className="w-full"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default NavigationBar;