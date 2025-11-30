'use client'

import { Key, Crown, User, Zap, MessageSquare, Webhook } from 'lucide-react'
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
    { id: 'account', label: 'Conta', icon: User, path: '/dashboard/account' }
  ]


  const handleNavigation = (item: typeof menuItems[0]) => {
    router.push(item.path)
  }

  const isActive = (item: typeof menuItems[0]) => {
    return pathname === item.path
  }

  return (
    <aside className="w-64 bg-white shadow-sm border-r shrink-0">
      <div className="p-6">
        <Link href='/dashboard'>
          <div className="flex items-center gap-2 mb-8">
            <Zap className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">ZAPI</span>
          </div>
        </Link>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${isActive(item) ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                  }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}