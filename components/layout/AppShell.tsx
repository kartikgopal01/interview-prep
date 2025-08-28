'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import ThemeToggle from '@/components/ThemeToggle'
import { cn } from '@/lib/utils'
import { Home, Bot, Users, User, Menu } from 'lucide-react'
import Image from 'next/image'
import { FloatingDock } from '@/components/ui/floating-dock'

type AppShellProps = {
  children: React.ReactNode
}

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/interview', label: 'AI Interview', icon: Bot },
  { href: '/peer-interview', label: 'Peer Interview', icon: Users },
  { href: '/profile', label: 'Profile', icon: User },
]

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const dockItems = navItems.map(({ href, label, icon: Icon }) => ({
    title: label,
    icon: <Icon className="size-5" />,
    href,
  }))

  return (
    <div className="min-h-screen w-full grid grid-rows-[auto_1fr] lg:grid-cols-[4rem_1fr] lg:grid-flow-col">
      {/* Topbar */}
      <header className="col-span-full lg:col-span-1 lg:col-start-2 h-20 bg-background/80 backdrop-blur border-b border-border flex items-center px-4 sm:px-6 gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
          <Menu className="size-5" />
        </Button>
        <div className="flex items-center gap-3">
          <Image
            src="/logo2.svg"
            alt="Interview Prep Logo"
            width={200}
            height={48}
            className="object-contain"
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Link href="/profile">
            <Button variant="outline" size="sm">Account</Button>
          </Link>
        </div>
      </header>

      {/* Bottom Dock */}
      <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center">
        <FloatingDock items={dockItems} desktopClassName="w-fit" />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-background border-r border-border shadow-lg p-2 flex flex-col">
            <div className="h-20 px-4 flex items-center border-b border-border">
              <Link href="/" className="font-semibold text-lg tracking-tight" onClick={() => setMobileOpen(false)}>
                Interview Prep
              </Link>
            </div>
            <nav className="flex-1 p-2 overflow-y-auto">
              <ul className="space-y-1">
                {navItems.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href))
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        className={cn(
                          'group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                          isActive
                            ? 'bg-accent text-accent-foreground'
                            : 'hover:bg-accent hover:text-accent-foreground'
                        )}
                        onClick={() => setMobileOpen(false)}
                      >
                        <Icon className="size-4" />
                        <span>{label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
            <div className="p-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="lg:col-start-2 overflow-x-hidden">
        <main className="p-6 pb-16">{children}</main>
      </div>
    </div>
  )
}


