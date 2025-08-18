'use client'
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User, BarChart3, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/utils";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    const navItems = [
        { href: "/", label: "Home" },
        { href: "/interview", label: "AI Interview" },
        { href: "/peer-interview", label: "Peer Interview" }
    ];

  useEffect(() => {
        // Check auth status on mount
        fetch('/api/auth/session')
            .then(res => res.json())
            .then(data => {
                if (data.user) {
                    setUser(data.user);
                }
            })
            .catch(console.error);
  }, []);
  
    const handleSignOut = async () => {
        // Clear component state before redirect
        setUser(null);
        // Use the comprehensive signOut utility
        await signOut();
    };
  
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
  };
  
  return (
        <>
            <nav className="fixed top-0 left-0 right-0 w-full bg-background/80 backdrop-blur-md border-b border-border shadow-sm z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-20">
                        <Link href="/">
                            <div className="flex items-center gap-2 cursor-pointer">
                                <Image
                                    src="/logo2.svg"
                                    alt="Interview Prep Logo"
                                    width={280}
                                    height={80}
                                    className="object-contain max-w-full h-auto"
                                />
                            </div>
                        </Link>

                        {/* Hamburger Menu Button */}
                        <button 
                            className="lg:hidden p-1.5 rounded-lg hover:bg-secondary"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <svg 
                                className="w-5 h-5" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center gap-6">
                            {navItems.map((item) => (
                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
                >
                                    {item.label}
                </Link>
                            ))}
                            <ThemeToggle />
                            {user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            className="relative h-10 w-10 rounded-full border-2 border-gray-200 hover:border-primary transition-all duration-200"
                                        >
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-white text-sm font-semibold shadow-md">
                                                {getInitials(user.name || user.email)}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-64 p-2" align="end">
                                        <DropdownMenuLabel className="font-normal">
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-medium leading-none">
                                                    {user.name}
                                                </p>
                                                <p className="text-xs leading-none text-muted-foreground">
                                                    {user.email}
                                                </p>
          </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        
                                        <DropdownMenuItem className="cursor-pointer p-2" asChild>
                                            <Link href="/profile" className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-primary" />
                                                <span>Profile</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        
                                        <DropdownMenuItem className="cursor-pointer p-2" asChild>
                                            <Link href="/profile?tab=analytics" className="flex items-center gap-2">
                                                <BarChart3 className="h-4 w-4 text-green-600" />
                                                <span>Analytics</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        
                                        <DropdownMenuSeparator />
              
                                        <DropdownMenuItem 
                                            className="cursor-pointer p-2 text-red-600 focus:bg-red-50"
                                            onClick={handleSignOut}
                                        >
                                            <div className="flex items-center gap-2 w-full">
                                                <LogOut className="h-4 w-4" />
                                                <span>Sign Out</span>
                                            </div>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Link href="/auth/sign-in">
                                    <Button className="btn-primary">
                                        Sign In
                                    </Button>
                                </Link>
                            )}
                        </div>
            </div>
        </div>

                {/* Mobile Navigation */}
          {isMenuOpen && (
                    <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-md">
                        <div className="px-4 py-3 space-y-3">
                            <div className="flex items-center justify-end">
                                <ThemeToggle />
                            </div>
                            {navItems.map((item) => (
                    <Link
                                    key={item.href}
                                    href={item.href}
                                    className="block text-foreground hover:text-primary transition-colors duration-200 font-medium py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                                    {item.label}
                    </Link>
                            ))}
                            
                            {user ? (
                                <div className="pt-2 border-t border-gray-100 space-y-2">
                                    <div className="flex items-center gap-3 px-2 py-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-white text-sm font-semibold">
                                            {getInitials(user.name || user.email)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{user.name}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                    </div>
                                    <Link 
                                        href="/profile" 
                                        className="block px-2 py-2 text-gray-700 hover:text-primary"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Profile
                                    </Link>
                                    <button 
                                        onClick={() => {
                                            handleSignOut();
                                            setIsMenuOpen(false);
                                        }}
                                        className="block w-full text-left px-2 py-2 text-red-600 hover:bg-red-50"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            ) : (
                                <div className="pt-2 border-t border-border">
                                    <Link href="/auth/sign-in" onClick={() => setIsMenuOpen(false)}>
                                        <Button className="btn-primary w-full">
                                            Sign In
                                        </Button>
                                    </Link>
                                </div>
          )}
                        </div>
      </div>
                )}
    </nav>
            {/* Spacer to prevent content overlap */}
            <div className="h-20"></div>
        </>
    )
}

export default Navigation 