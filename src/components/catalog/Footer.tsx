import Link from "next/link"
import { Lock } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-slate-200 bg-white py-8 mt-auto relative z-10">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-slate-500 font-medium">
          &copy; {currentYear} Enhorabuena. Todos los derechos reservados.
        </div>
        
        <div className="flex items-center gap-6">
          <Link 
            href="/privacidad" 
            className="text-sm text-slate-500 hover:text-primary transition-colors font-medium"
          >
            Aviso de Privacidad
          </Link>
          
          <Link 
            href="/admin/login" 
            className="text-slate-400 hover:text-primary transition-colors"
            title="Panel de Administración"
          >
            <Lock className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </footer>
  )
}
