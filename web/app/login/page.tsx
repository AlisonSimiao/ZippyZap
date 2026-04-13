"use client"

import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Logo from "../../components/logo"
import toast from "react-hot-toast"
import { Mail, Lock, ArrowRight, Loader2, Github, Chrome } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false
      })
      
      if(result?.error) {
         toast.error(result.error || "Credenciais inválidas", {
          position: "top-right"
        })
        setLoading(false)
        return
      }

      if (result?.ok) {
        toast.success("Bem-vindo de volta!", {
          position: "top-right"
        })
        router.push("/dashboard")
      }
    } catch (error) {
      toast.error("Erro ao realizar login")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="mb-6 transform hover:scale-105 transition-transform duration-500">
            <Logo />
          </div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Bem-vindo</h1>
          <p className="text-foreground/40 text-sm font-medium uppercase tracking-[0.2em]">Acesse sua conta ZippyZap</p>
        </div>

        <div className="bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-black/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    className="pl-12 bg-white/[0.03] border-white/5 focus-visible:ring-primary/50 h-12 rounded-xl transition-all placeholder:text-foreground/10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Senha</Label>
                  <Link href="#" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary/70 transition-colors">
                    Esqueceu?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="pl-12 bg-white/[0.03] border-white/5 focus-visible:ring-primary/50 h-12 rounded-xl transition-all placeholder:text-foreground/10"
                  />
                </div>
              </div>
            </div>

            <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary text-white hover:opacity-90 font-bold uppercase tracking-widest text-xs h-12 rounded-xl shadow-lg shadow-primary/20 transition-all group"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Entrar na Plataforma
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 flex flex-col gap-4">
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/5"></span>
                </div>
                <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                    <span className="bg-[#0c0c0c] px-4 text-foreground/20">Ou continue com</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="bg-transparent border-white/5 hover:bg-white/5 text-foreground/60 h-11 rounded-xl font-bold text-[10px] uppercase tracking-widest">
                    <Chrome className="mr-2 h-3.5 w-3.5" />
                    Google
                </Button>
                <Button variant="outline" className="bg-transparent border-white/5 hover:bg-white/5 text-foreground/60 h-11 rounded-xl font-bold text-[10px] uppercase tracking-widest">
                    <Github className="mr-2 h-3.5 w-3.5" />
                    GitHub
                </Button>
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          <p className="text-xs font-medium text-foreground/30">
            Não tem uma conta?{" "}
            <Link href="/signup" className="text-primary hover:text-primary/70 font-bold transition-colors">
              Criar agora &rarr;
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