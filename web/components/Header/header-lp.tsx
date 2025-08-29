import { Menu, X } from "lucide-react"
import { Button } from "../ui/button"
import Logo from "../logo"
import { useState } from "react"
import Link from "next/link"

export const HeaderLp: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="border-b border-gray-200 bg-[#333333] sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Logo />
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-white/80 hover:text-white transition-colors">
            Recursos
          </a>
          <a href="#docs" className="text-white/80 hover:text-white transition-colors">
            Documentação
          </a>
          <a href="#pricing" className="text-white/80 hover:text-white transition-colors">
            Preços
          </a>
          <Link href="/login">
            <Button
              variant="outline"
              size="sm"
              className="border-white text-white hover:bg-white hover:text-[#333333] bg-transparent"
            >
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="bg-[#FFD700] text-black hover:bg-[#FFD700]/90">
              Começar Grátis
            </Button>
          </Link>
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
            <a 
              href="#docs" 
              className="text-white/80 hover:text-white transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Documentação
            </a>
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
