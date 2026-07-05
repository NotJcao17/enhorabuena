import { ConfigClient } from "./ConfigClient"

export default function ConfiguracionPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Configuración</h2>
      <ConfigClient />
    </div>
  )
}
