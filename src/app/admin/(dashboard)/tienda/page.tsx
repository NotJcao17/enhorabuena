import { TiendaClient } from "./TiendaClient"

export default function TiendaPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Tienda Personal</h2>
      <TiendaClient />
    </div>
  )
}
