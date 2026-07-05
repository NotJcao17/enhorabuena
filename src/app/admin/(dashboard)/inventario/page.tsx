import { InventoryClient } from "./InventoryClient"

export default function InventarioPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Inventario Betterware</h2>
      <InventoryClient />
    </div>
  )
}
