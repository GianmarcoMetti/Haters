import { Sidebar } from './sidebar'
import { MobileNav } from './mobile-nav'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Navigation */}
        <MobileNav />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
