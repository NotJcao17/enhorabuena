import { RefreshCw, Menu } from "lucide-react"

export function Header({ lastSync, onMenuClick }: { lastSync: Date | null, onMenuClick?: () => void }) {
  const syncText = lastSync 
    ? new Intl.DateTimeFormat("es-MX", { 
        dateStyle: "medium", 
        timeStyle: "short",
        timeZone: "America/Mexico_City"
      }).format(new Date(lastSync))
    : "Nunca"

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-md hover:bg-slate-100 text-slate-600 md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg md:text-xl font-semibold text-slate-800 line-clamp-1">Panel Admin</h1>
      </div>
      
      <div className="flex items-center text-xs md:text-sm text-slate-500 whitespace-nowrap">
        <RefreshCw className="mr-1.5 md:mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
        <span className="hidden sm:inline">Última sync: {syncText}</span>
        <span className="sm:hidden">{syncText}</span>
      </div>
    </header>
  )
}
