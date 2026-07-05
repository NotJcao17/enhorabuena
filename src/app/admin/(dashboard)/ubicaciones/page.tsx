import { LocationsClient } from "./LocationsClient"

export default function UbicacionesPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold tracking-tight mb-6">Gestión de Ubicaciones</h2>
      <LocationsClient />
    </div>
  )
}
