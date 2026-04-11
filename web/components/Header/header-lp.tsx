import { Menu, X } from "lucide-react"
import { Button } from "../ui/button"
import Logo from "../logo"
import { useState } from "react"
import Link from "next/link"

export const HeaderLp: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Logo />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
            Recursos
          </a>
          <Link href="/docs" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
            Documentação
          </Link>
          <Link href="/docs#api-reference" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
            API Reference
          </Link>
          <a href="#pricing" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
            Preços
          </a>
          <div className="flex items-center gap-3 ml-4">
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground/70 hover:text-foreground hover:bg-white/5"
              >
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-primary text-primary-foreground hover:opacity-90 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                Começar Grátis
              </Button>
            </Link>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#333333] border-t border-gray-600">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <a
              href="#features"
              className="text-white/80 hover:text-white transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Recursos
            </a>
            <Link
              href="/docs"
              className="text-white/80 hover:text-white transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Documentação
            </Link>
            <Link
              href="/docs#api-reference"
              className="text-white/80 hover:text-white transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              API Reference
            </Link>
            <a
              href="#pricing"
              className="text-white/80 hover:text-white transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Preços
            </a>
            <div className="flex flex-col gap-3 pt-2">
              <Link href="/login" className="w-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-white text-white hover:bg-white hover:text-[#333333] bg-transparent"
                >
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="w-full bg-[#FFD700] text-black hover:bg-[#FFD700]/90">
                  Começar Grátis
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
