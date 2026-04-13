'use client'

import { Key, Crown, User, Zap, MessageSquare, Webhook, Activity, ChevronLeft, ChevronRight, LayoutDashboard, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import Logo from '../logo'
import { useState } from 'react'
import { Button } from '../ui/button'

export const Sidebar: React.FC = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'whatsapp', label: 'Conectar App', icon: MessageSquare, path: '/dashboard/whatsapp' },
    { id: 'apikeys', label: 'API Keys', icon: Key, path: '/dashboard/apikeys' },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook, path: '/dashboard/webhooks' },
    { id: 'plans', label: 'Meu Plano', icon: Crown, path: '/dashboard/plans' },
    { id: 'status', label: 'Service Status', icon: Activity, path: '/dashboard/status' }
  ]

  const bottomItems = [
    { id: 'account', label: 'Minha Conta', icon: User, path: '/dashboard/account' },
    { id: 'settings', label: 'Configurações', icon: Settings, path: '/dashboard/settings' }
  ]

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <aside 
        className={`${collapsed ? 'w-20' : 'w-72'} bg-[#0c0c0c] border-r border-white/5 shrink-0 flex flex-col transition-all duration-500 ease-in-out relative z-30`}
    >
      {/* Collapse Toggle */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-24 w-6 h-6 bg-background border border-white/5 rounded-full flex items-center justify-center text-foreground/40 hover:text-primary hover:border-primary/50 transition-all z-50 shadow-xl"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Logo Section */}
      <div className="p-8 h-24 flex items-center overflow-hidden">
        <Link href='/dashboard'>
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary/20 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:bg-primary/30 shadow-lg shadow-primary/10">
              <Zap className="h-5 w-5 text-primary fill-primary/20" />
            </div>
            {!collapsed && (
                <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-500">
                    <span className="text-xl font-serif font-black tracking-tight text-foreground leading-none">ZippyZap</span>
                    <span className="text-[8px] font-black tracking-[0.3em] uppercase text-primary/60 mt-0.5">Automations</span>
                </div>
            )}
          </div>
        </Link>
      </div>

      <div className="flex-1 px-4 space-y-10 py-4 overflow-y-auto no-scrollbar">
        {/* Main Navigation */}
        <nav className="space-y-1.5">
          {!collapsed && (
              <p className="px-4 text-[9px] font-black uppercase tracking-[0.2em] text-foreground/20 mb-4">Plataforma</p>
          )}
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 group ${
                  active 
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5' 
                    : 'text-foreground/30 hover:text-foreground/60 hover:bg-white/[0.02]'
                }`}
                title={collapsed ? item.label : ''}
              >
                <Icon className={`h-4.5 w-4.5 shrink-0 transition-all duration-300 ${active ? 'text-primary scale-110' : 'group-hover:text-primary group-hover:scale-110'}`} />
                {!collapsed && (
                    <span className="truncate tracking-wide">{item.label}</span>
                )}
                {active && !collapsed && (
                    <div className="ml-auto w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                )}
              </button>
            )
          })}
        </nav>

        {/* Support Section */}
        <nav className="space-y-1.5">
          {!collapsed && (
              <p className="px-4 text-[9px] font-black uppercase tracking-[0.2em] text-foreground/20 mb-4">Suporte & Conta</p>
          )}
          {bottomItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 group ${
                  active 
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5' 
                    : 'text-foreground/30 hover:text-foreground/60 hover:bg-white/[0.02]'
                }`}
                title={collapsed ? item.label : ''}
              >
                <Icon className={`h-4.5 w-4.5 shrink-0 transition-all duration-300 ${active ? 'text-primary scale-110' : 'group-hover:text-primary group-hover:scale-110'}`} />
                {!collapsed && (
                    <span className="truncate tracking-wide">{item.label}</span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Footer Info */}
      {!collapsed && (
          <div className="p-8 border-t border-white/5 space-y-4">
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">Limite Diário</span>
                      <span className="text-[9px] font-bold text-primary">85%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[85%] rounded-full shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
                  </div>
                  <Button variant="link" className="p-0 h-auto text-[8px] font-black uppercase tracking-[0.2em] text-primary/60 hover:text-primary transition-colors">
                      Upgrade Plano &rarr;
                  </Button>
              </div>
          </div>
      )}
    </aside>
  )
}