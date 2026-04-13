import { Menu, X } from "lucide-react"
import { Button } from "../ui/button"
import Logo from "../logo"
import { useState } from "react"
import Link from "next/link"

export const HeaderLp: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between h-20">
        <Link href="/" className="hover:opacity-80 transition-opacity">
            <Logo />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-10">
          <a href="/#features" className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 hover:text-primary transition-all">
            Recursos
          </a>
          <Link href="/docs" className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 hover:text-primary transition-all">
            Documentação
          </Link>
          <a href="/#pricing" className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 hover:text-primary transition-all">
            Preços
          </a>
          
          <div className="flex items-center gap-6 ml-6 border-l border-white/5 pl-10">
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 hover:text-foreground hover:bg-white/5 h-10 px-6"
              >
                Entrar
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20 h-10 px-8 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-primary/20">
                Criar Conta
              </Button>
            </Link>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-foreground/60 p-2 hover:bg-white/5 rounded-xl transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-background/95 backdrop-blur-2xl border-b border-white/5 absolute top-full left-0 w-full animate-in fade-in slide-in-from-top-4 duration-300">
          <nav className="container mx-auto px-6 py-8 flex flex-col gap-6">
            <a
              href="/#features"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 hover:text-primary transition-all py-3 border-b border-white/[0.02]"
              onClick={() => setIsMenuOpen(false)}
            >
              Recursos
            </a>
            <Link
              href="/docs"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 hover:text-primary transition-all py-3 border-b border-white/[0.02]"
              onClick={() => setIsMenuOpen(false)}
            >
              Documentação
            </Link>
            <a
              href="/#pricing"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 hover:text-primary transition-all py-3 border-b border-white/[0.02]"
              onClick={() => setIsMenuOpen(false)}
            >
              Preços
            </a>
            <div className="flex flex-col gap-4 pt-6">
              <Link href="/login" className="w-full">
                <Button
                  variant="outline"
                  className="w-full border-white/5 text-foreground/60 hover:bg-white/5 bg-transparent h-12 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em]"
                >
                  Fazer Login
                </Button>
              </Link>
              <Link href="/signup" className="w-full">
                <Button className="w-full bg-primary text-white hover:opacity-90 h-12 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-primary/20">
                  Começar Agora
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
