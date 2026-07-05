import { RefreshCw } from "lucide-react"

export function Header({ lastSync }: { lastSync: Date | null }) {
  const syncText = lastSync 
    ? new Intl.DateTimeFormat("es-MX", { 
        dateStyle: "medium", 
        timeStyle: "short" 
      }).format(new Date(lastSync))
    : "Nunca"

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <h1 className="text-xl font-semibold text-slate-800">Panel de Administración</h1>
      
      <div className="flex items-center text-sm text-slate-500">
        <RefreshCw className="mr-2 h-4 w-4" />
        <span>Última sync: {syncText}</span>
      </div>
    </header>
  )
}
