"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import toast from "react-hot-toast"
import { Search, Plus } from "lucide-react"

export default function RegistrarPage() {
  const [sku, setSku] = useState("")
  const [quantity, setQuantity] = useState<number | "">(1)
  const [locationId, setLocationId] = useState("null")
  const [locations, setLocations] = useState<{id: number, name: string}[]>([])
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetch("/api/locations").then(r => r.json()).then(setLocations)
  }, [])

  useEffect(() => {
    if (sku.length === 5) {
      setLoading(true)
      fetch(`/api/products/${sku}`)
        .then(r => {
          if (!r.ok) throw new Error()
          return r.json()
        })
        .then(setProduct)
        .catch(() => setProduct(null))
        .finally(() => setLoading(false))
    } else {
      setProduct(null)
    }
  }, [sku])

  const handleRegister = async () => {
    if (!product) return
    setIsSubmitting(true)
    const toastId = toast.loading("Registrando unidades...")
    
    const finalQuantity = typeof quantity === 'number' && quantity > 0 ? quantity : 1;
    
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        body: JSON.stringify({
          sku,
          locationId: locationId === "null" ? null : parseInt(locationId),
          quantity: finalQuantity
        })
      })
      if (!res.ok) throw new Error()
      
      toast.success(`${finalQuantity} unidad(es) registrada(s)`, { id: toastId })
      setSku("")
      setQuantity(1)
      setProduct(null)
    } catch {
      toast.error("Error al registrar", { id: toastId })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Registro Manual</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Ingresar SKU</CardTitle>
          <CardDescription>Escribe el código de 5 dígitos del producto Betterware</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input 
              className="pl-10 text-lg h-12"
              placeholder="Ej. 25335"
              value={sku}
              onChange={(e) => setSku(e.target.value.replace(/\D/g, '').slice(0, 5))}
              maxLength={5}
            />
          </div>

          {loading && <div className="text-sm text-slate-500">Buscando producto...</div>}
          
          {sku.length === 5 && !loading && !product && (
            <div className="p-4 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
              ❌ SKU {sku} no encontrado en el catálogo de Betterware. Asegúrate de sincronizar o verificar el código.
            </div>
          )}

          {product && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-slate-50">
                {product.images[0] && (
                  <img src={product.images[0].src} alt="" className="w-16 h-16 object-cover rounded-md border bg-white" />
                )}
                <div>
                  <h4 className="font-medium text-slate-900">{product.title}</h4>
                  <p className="text-sm text-slate-500">SKU: {product.sku}</p>
                  <p className="text-sm font-semibold mt-1">${Number(product.priceBetterware).toFixed(2)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ubicación</label>
                  <Select 
                    value={locationId} 
                    onChange={(e) => setLocationId(e.target.value)}
                    options={[
                      { value: "null", label: "Sin ubicación" },
                      ...locations.map(l => ({ value: l.id.toString(), label: l.name }))
                    ]}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cantidad</label>
                  <Input 
                    type="number" 
                    min="1" 
                    value={quantity} 
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        setQuantity("");
                      } else {
                        const parsed = parseInt(val);
                        setQuantity(isNaN(parsed) ? "" : parsed);
                      }
                    }} 
                  />
                </div>
              </div>

              <Button 
                className="w-full h-12 text-lg" 
                onClick={handleRegister} 
                disabled={isSubmitting}
              >
                <Plus className="mr-2 h-5 w-5" /> Registrar en Inventario
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
