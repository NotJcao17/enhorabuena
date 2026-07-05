import { HistorialClient } from "./HistorialClient"

export default function HistorialPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Historial de Ventas</h2>
      <HistorialClient />
    </div>
  )
}
