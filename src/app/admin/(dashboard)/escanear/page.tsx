import { ScannerClient } from "./ScannerClient"

export default function EscanearPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Escáner de Código de Barras</h2>
      <ScannerClient />
    </div>
  )
}
