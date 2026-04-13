"use client"

import Logo from "../../components/logo"
import { api } from "@/lib/api"
import toast from "react-hot-toast"
import { AxiosError } from "axios"
import { useActionState, useState, useEffect } from "react"
import {  MessageSquareWarningIcon, User, Mail, Smartphone, Lock, ArrowRight, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  const [state, action, isPending] = useActionState(registerAction, { errors: {} })
  const [formData, setFormData] = useState({ name: '', email: '', whatsapp: '', password: '' })
  const [isRedirecting, setIsRedirecting] = useState(false)
  const router = useRouter()
  
  async function registerAction(prevState: any, formData: FormData) {
    try {
      const email = formData.get("email") as string
      const whatsapp = formData.get("whatsapp") as string
      const password = formData.get("password") as string
      const name = formData.get("name") as string
      
      setFormData({ name, email, whatsapp, password })

      const response = await api.signup({email, whatsapp, password, name})

      // Salvar token JWT para auto-login
      if (response.data?.token) {
        localStorage.setItem("accessToken", response.data.token)
      }

      toast.success("Conta criada com sucesso! Redirecionando...", {
        position: "top-right"
      })
      
      // Aguardar um pouco antes de redirecionar
      setIsRedirecting(true)
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
      
      return { errors: {} }
    } catch (error) {
      if(error instanceof AxiosError){
        if(error.response?.status === 409){
          const rel = error.response.data.message.includes('Email') ? 'email' : 'whatsapp'
          toast.error(error.response.data.message, {
            position: "top-right"
          })
          return { errors: { [rel]: error.response.data.message } }
        }

        if(error.response?.status === 422){
          const errors: Record<string, string> = {}
          Object.keys(error.response?.data || {}).forEach((key) => {
            const message = error?.response?.data[key][0]
            if(message){ 
              toast.error(message, {
                style: {backgroundColor: "#eecf1d"},
                icon: <MessageSquareWarningIcon />,
                position: "top-right"
              })
              errors[key] = message
            }
          })
          return { errors }
        }
      }

      toast.error('Erro ao conectar ao servidor', {
        position: "top-right"
      })
      return { errors: {} }
    }
  }

  // Desabilitar navegação para trás enquanto redirecionando
  useEffect(() => {
    if (isRedirecting) {
      const preventBack = () => window.history.forward()
      window.addEventListener('popstate', preventBack)
      return () => window.removeEventListener('popstate', preventBack)
    }
  }, [isRedirecting])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <div className="w-full max-w-lg space-y-8 relative z-10">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="mb-6 transform hover:scale-105 transition-transform duration-500">
            <Logo />
          </div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Criar Conta</h1>
          <p className="text-foreground/40 text-sm font-medium uppercase tracking-[0.2em]">Inicie sua jornada ZippyZap</p>
        </div>

        <div className="bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-black/20">
          <form action={action} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">Nome Completo</Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Seu nome"
                    className="pl-12 bg-white/[0.03] border-white/5 focus-visible:ring-primary/50 h-12 rounded-xl transition-all placeholder:text-foreground/10"
                  />
                </div>
                {state.errors.name && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider ml-1 mt-1">{state.errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">WhatsApp</Label>
                <div className="relative group">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="whatsapp"
                    name="whatsapp"
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="5511999999999"
                    className="pl-12 bg-white/[0.03] border-white/5 focus-visible:ring-primary/50 h-12 rounded-xl transition-all placeholder:text-foreground/10"
                  />
                </div>
                {state.errors.whatsapp && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider ml-1 mt-1">{state.errors.whatsapp}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">Endereço de Email</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="seu@email.com"
                  className="pl-12 bg-white/[0.03] border-white/5 focus-visible:ring-primary/50 h-12 rounded-xl transition-all placeholder:text-foreground/10"
                  required
                />
              </div>
              {state.errors.email && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider ml-1 mt-1">{state.errors.email}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">Senha de Acesso</Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  className="pl-12 bg-white/[0.03] border-white/5 focus-visible:ring-primary/50 h-12 rounded-xl transition-all placeholder:text-foreground/10"
                />
              </div>
              {state.errors.password && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider ml-1 mt-1">{state.errors.password}</p>}
            </div>

            <Button 
                type="submit" 
                disabled={isPending || isRedirecting}
                className="w-full bg-primary text-white hover:opacity-90 font-bold uppercase tracking-widest text-xs h-12 rounded-xl shadow-lg shadow-primary/20 transition-all group"
            >
              {isPending || isRedirecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Criar Minha Conta
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-[10px] text-foreground/20 font-medium leading-relaxed uppercase tracking-wider">
            Ao se registrar, você concorda com nossos <Link href="#" className="text-foreground/40 hover:text-primary transition-colors underline decoration-primary/20">Termos de Serviço</Link> e <Link href="#" className="text-foreground/40 hover:text-primary transition-colors underline decoration-primary/20">Privacidade</Link>.
          </p>
        </div>

        <div className="text-center space-y-4">
          <p className="text-xs font-medium text-foreground/30">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-primary hover:text-primary/70 font-bold transition-colors">
              Fazer Login &rarr;
            </Link>
          </p>
          <Link href="/" className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/20 hover:text-foreground/40 transition-colors">
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  )
}