'use client'

import { signOut, useSession } from 'next-auth/react'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { LogOut, User, Bell, Search, Settings } from 'lucide-react'
import { IUser } from '@/types/user.types'
import { Input } from '../ui/input'

export const DashboardHeader: React.FC = () => {
  const { data: session } = useSession()
  const user = session?.user as IUser

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' })
  }

  return (
    <header className="bg-background/80 backdrop-blur-xl border-b border-white/5 py-4 px-8 sticky top-0 z-40">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-8 flex-1">
          <div className="relative group max-w-md w-full hidden md:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
            <Input 
                placeholder="Buscar recursos, mensagens, chaves..." 
                className="bg-white/[0.03] border-white/5 focus-visible:ring-primary/50 h-10 pl-11 rounded-xl text-xs font-medium placeholder:text-foreground/10"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 pr-6 border-r border-white/5">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-foreground/40 hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
                <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-foreground/40 hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
                <Settings className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-xs font-bold tracking-tight">
                {session?.user?.name || 'Usuário'}
              </span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none">
                Membro Pro
              </span>
            </div>
            
            <div className="relative group cursor-pointer">
                <Avatar className="h-10 w-10 border border-white/5 p-0.5 bg-white/[0.02]">
                    <AvatarImage src={user?.image || ''} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-serif">
                        {user?.name?.charAt(0) || <User className="h-4 w-4" />}
                    </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>

            <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-9 w-9 text-foreground/20 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
            >
                <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}