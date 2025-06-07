"use client"

import { SignedIn, UserButton, useUser } from "@clerk/nextjs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User, BarChart3, LogOut, Settings } from "lucide-react";
import Link from "next/link";

const UserMenu = () => {
    const { user } = useUser();

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <SignedIn>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button 
                        variant="ghost" 
                        className="relative h-10 w-10 rounded-full border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold shadow-md">
                            {user?.firstName && user?.lastName ? 
                                getInitials(`${user.firstName} ${user.lastName}`) : 
                                getInitials(user?.fullName || user?.emailAddresses?.[0]?.emailAddress || 'U')
                            }
                        </div>
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-900"></div>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                                {user?.firstName && user?.lastName ? 
                                    `${user.firstName} ${user.lastName}` : 
                                    user?.fullName
                                }
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {user?.emailAddresses?.[0]?.emailAddress}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem className="cursor-pointer p-2 focus:bg-blue-50 dark:focus:bg-blue-900/20" asChild>
                        <Link href="/profile" className="flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span>Profile</span>
                        </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem className="cursor-pointer p-2 focus:bg-blue-50 dark:focus:bg-blue-900/20" asChild>
                        <Link href="/profile?tab=analytics" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span>Analytics</span>
                        </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem className="cursor-pointer p-2 text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20">
                        <div className="flex items-center gap-2 w-full">
                            <LogOut className="h-4 w-4" />
                            <UserButton 
                                appearance={{
                                    elements: {
                                        userButtonBox: "w-full",
                                        userButtonTrigger: "w-full justify-start p-0 h-auto bg-transparent hover:bg-transparent text-red-600 dark:text-red-400"
                                    }
                                }}
                                showName={false}
                                userProfileMode="navigation"
                            />
                        </div>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </SignedIn>
    );
};

export default UserMenu; 