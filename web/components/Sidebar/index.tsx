'use client'

import { Key, Crown, User, Zap, MessageSquare, Webhook, Activity } from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const router = useRouter()
  const pathname = usePathname()

  const menuItems = [
    { id: 'apikeys', label: 'API Keys', icon: Key, path: '/dashboard/apikeys' },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, path: '/dashboard/whatsapp' },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook, path: '/dashboard/webhooks' },
    { id: 'plans', label: 'Planos', icon: Crown, path: '/dashboard/plans' },
    { id: 'account', label: 'Conta', icon: User, path: '/dashboard/account' },
    { id: 'status', label: 'Status', icon: Activity, path: '/dashboard/status' }
  ]


  const handleNavigation = (item: typeof menuItems[0]) => {
    router.push(item.path)
  }

  const isActive = (item: typeof menuItems[0]) => {
    return pathname === item.path
  }

  return (
    <aside className="w-64 bg-sidebar border-sidebar-border border-r shrink-0">
      <div className="p-6">
        <Link href='/dashboard'>
          <div className="flex items-center gap-2 mb-8 group">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-serif font-bold tracking-tight text-foreground">ZAPI</span>
          </div>
        </Link>

        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item)
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                  active 
                    ? 'bg-primary/15 text-primary border border-primary/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]' 
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-white/5'
                }`}
              >
                <Icon className={`h-4 w-4 transition-colors ${active ? 'text-primary' : 'text-inherit'}`} />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}