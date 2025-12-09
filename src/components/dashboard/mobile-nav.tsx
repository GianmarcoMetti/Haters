'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Menu,
  X,
  LayoutDashboard,
  MessageSquare,
  Flag,
  FileText,
  Settings,
  Link as LinkIcon,
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Social Accounts', href: '/dashboard/accounts', icon: LinkIcon },
  { name: 'Comments', href: '/dashboard/comments', icon: MessageSquare },
  { name: 'Flagged Content', href: '/dashboard/flags', icon: Flag },
  { name: 'Cases', href: '/dashboard/cases', icon: FileText },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Header */}
      <div className="flex h-16 items-center justify-between border-b bg-card px-4 lg:hidden">
        <h1 className="text-xl font-bold">Haters</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="fixed inset-y-0 left-0 w-64 bg-card shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Navigation */}
            <nav className="flex flex-col h-full">
              <div className="flex-1 space-y-1 px-3 py-4">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>

              {/* Sign Out */}
              <div className="border-t p-3">
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                </form>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
