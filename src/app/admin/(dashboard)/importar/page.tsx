"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Select } from "@/components/ui/Select"
import { Textarea } from "@/components/ui/Textarea"
import toast from "react-hot-toast"
import { Upload } from "lucide-react"

type PreviewRow = {
  sku: string
  quantity: number
  product: any | null
  status: 'valid' | 'not_found' | 'error'
}

export default function ImportarCSVPage() {
  const [csvData, setCsvData] = useState("")
  const [locationId, setLocationId] = useState("null")
  const [locations, setLocations] = useState<{id: number, name: string}[]>([])
  
  const [preview, setPreview] = useState<PreviewRow[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  useEffect(() => {
    fetch("/api/locations").then(r => r.json()).then(setLocations)
  }, [])

  const handlePreview = async () => {
    if (!csvData.trim()) return
    setIsProcessing(true)
    
    const lines = csvData.split("\n").map(l => l.trim()).filter(l => l.length > 0)
    const results: PreviewRow[] = []
    
    for (const line of lines) {
      const parts = line.split(",")
      const sku = parts[0]?.trim()
      const quantity = parseInt(parts[1]?.trim() || "1")
      
      if (!sku || sku.length !== 5) {
        results.push({ sku: sku || "Vacío", quantity: 0, product: null, status: 'error' })
        continue
      }
      
      try {
        const res = await fetch(`/api/products/${sku}`)
        if (res.ok) {
          const product = await res.json()
          results.push({ sku, quantity, product, status: 'valid' })
        } else {
          results.push({ sku, quantity, product: null, status: 'not_found' })
        }
      } catch {
        results.push({ sku, quantity, product: null, status: 'error' })
      }
    }
    
    setPreview(results)
    setIsProcessing(false)
  }

  const handleImport = async () => {
    const validRows = preview.filter(r => r.status === 'valid')
    if (validRows.length === 0) return
    
    setIsImporting(true)
    const toastId = toast.loading("Importando productos...")
    let successCount = 0
    let failCount = 0
    
    for (const row of validRows) {
      try {
        const res = await fetch("/api/inventory", {
          method: "POST",
          body: JSON.stringify({
            sku: row.sku,
            locationId: locationId === "null" ? null : parseInt(locationId),
            quantity: row.quantity
          })
        })
        if (res.ok) {
          successCount++
        } else {
          failCount++
        }
      } catch {
        failCount++
      }
    }
    
    setIsImporting(false)
    if (failCount === 0) {
      toast.success(`${successCount} SKUs importados correctamente`, { id: toastId })
      setCsvData("")
      setPreview([])
    } else {
      toast.error(`Importados: ${successCount}. Errores: ${failCount}`, { id: toastId })
    }
  }

  const validCount = preview.filter(r => r.status === 'valid').length
  const validQuantity = preview.filter(r => r.status === 'valid').reduce((sum, r) => sum + r.quantity, 0)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Importación Masiva (CSV)</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Pegar Datos</CardTitle>
          <CardDescription>Pega aquí los datos en formato: <code>SKU,cantidad</code> por línea</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Ubicación de destino (aplica a todos)</label>
            <Select 
              className="max-w-xs"
              value={locationId} 
              onChange={(e) => setLocationId(e.target.value)}
              options={[
                { value: "null", label: "Sin ubicación" },
                ...locations.map(l => ({ value: l.id.toString(), label: l.name }))
              ]}
            />
          </div>
          
          <Textarea 
            className="font-mono h-40" 
            placeholder={"25335,2\n26754,1\n26989,5"}
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
          />
          
          <Button onClick={handlePreview} disabled={isProcessing || !csvData.trim()}>
            {isProcessing ? "Validando..." : "Validar SKUs"}
          </Button>
        </CardContent>
      </Card>
      
      {preview.length > 0 && (
        <Card className="animate-in fade-in duration-300">
          <CardHeader>
            <CardTitle>Vista Previa</CardTitle>
            <CardDescription>
              {validCount} SKUs válidos ({validQuantity} unidades en total). Revisa antes de importar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Producto</th>
                    <th className="px-4 py-3 text-right">Cant.</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {preview.map((row, i) => (
                    <tr key={i} className={row.status === 'valid' ? '' : 'bg-red-50 text-red-900'}>
                      <td className="px-4 py-3">
                        {row.status === 'valid' ? '✅' : '❌'}
                      </td>
                      <td className="px-4 py-3 font-mono">{row.sku}</td>
                      <td className="px-4 py-3">
                        {row.product ? row.product.title : 'No encontrado en catálogo'}
                      </td>
                      <td className="px-4 py-3 text-right">{row.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-end">
              <Button 
                size="lg" 
                onClick={handleImport} 
                disabled={validCount === 0 || isImporting}
              >
                <Upload className="mr-2 h-5 w-5" /> 
                {isImporting ? "Importando..." : `Importar ${validQuantity} unidades`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
