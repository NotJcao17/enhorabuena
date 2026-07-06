"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Package, 
  ScanBarcode, 
  PlusSquare, 
  FileUp, 
  Store, 
  History, 
  MapPin, 
  Settings,
  LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut } from "next-auth/react"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Inventario BW", href: "/admin/inventario", icon: Package },
  { name: "Escanear", href: "/admin/escanear", icon: ScanBarcode },
  { name: "Registrar Manual", href: "/admin/registrar", icon: PlusSquare },
  { name: "Importar CSV", href: "/admin/importar", icon: FileUp },
  { name: "Tienda Personal", href: "/admin/tienda", icon: Store },
  { name: "Historial", href: "/admin/historial", icon: History },
  { name: "Ubicaciones", href: "/admin/ubicaciones", icon: MapPin },
  { name: "Configuración", href: "/admin/configuracion", icon: Settings },
]

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center px-6 border-b border-slate-200">
        <span className="text-2xl font-[family-name:var(--font-bebas)] tracking-wider text-slate-900">Enhorabuena</span>
        <span className="ml-2 text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Admin</span>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href))
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md group transition-colors",
                isActive 
                  ? "bg-slate-900 text-white" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
              onClick={onClose}
            >
              <Icon 
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900"
                )} 
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-200">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex w-full items-center px-3 py-2 text-sm font-medium text-slate-600 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors group"
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-slate-400 group-hover:text-red-500" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
