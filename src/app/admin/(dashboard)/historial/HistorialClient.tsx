"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Textarea } from "@/components/ui/Textarea"
import { Modal } from "@/components/ui/Modal"
import toast from "react-hot-toast"
import { MoreHorizontal, Calendar } from "lucide-react"

type Sale = {
  id: number
  type: "bw" | "custom"
  productName: string
  sku: string | null
  category: string
  salePrice: number
  soldAt: string
  locationName: string | null
  isReversed: boolean
  quantity: number
  notes: string | null
}

export function HistorialClient() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("active")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  // Modals
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [actionModal, setActionModal] = useState<"edit" | "revert" | null>(null)
  const [actionMenuId, setActionMenuId] = useState<number | null>(null)
  
  // Form states
  const [editPrice, setEditPrice] = useState("")
  const [editNotes, setEditNotes] = useState("")

  const fetchSales = async () => {
    try {
      const res = await fetch("/api/sales")
      const data = await res.json()
      setSales(data)
    } catch {
      toast.error("Error al cargar ventas")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSales() }, [])

  const handleEdit = async () => {
    if (!selectedSale) return
    const toastId = toast.loading("Actualizando venta...")
    try {
      const endpoint = selectedSale.type === 'bw' ? `/api/sales/bw/${selectedSale.id}` : `/api/sales/custom/${selectedSale.id}`
      const res = await fetch(endpoint, {
        method: "PUT",
        body: JSON.stringify({ action: "edit", salePrice: editPrice, notes: editNotes }),
      })
      if (!res.ok) throw new Error()
      toast.success("Venta actualizada", { id: toastId })
      setActionModal(null)
      fetchSales()
    } catch {
      toast.error("Error al actualizar", { id: toastId })
    }
  }

  const handleRevert = async () => {
    if (!selectedSale) return
    const toastId = toast.loading("Revertiendo venta...")
    try {
      const endpoint = selectedSale.type === 'bw' ? `/api/sales/bw/${selectedSale.id}` : `/api/sales/custom/${selectedSale.id}`
      const res = await fetch(endpoint, {
        method: "PUT",
        body: JSON.stringify({ action: "revert" }),
      })
      if (!res.ok) throw new Error()
      toast.success("Venta revertida exitosamente", { id: toastId })
      setActionModal(null)
      fetchSales()
    } catch {
      toast.error("Error al revertir", { id: toastId })
    }
  }

  const filteredSales = sales.filter(s => {
    const matchSearch = s.productName.toLowerCase().includes(search.toLowerCase()) || 
                        (s.sku && s.sku.includes(search))
    const matchType = typeFilter === "all" || s.type === typeFilter
    const matchStatus = statusFilter === "all" || 
                       (statusFilter === "active" && !s.isReversed) ||
                       (statusFilter === "reversed" && s.isReversed)
    
    let matchDate = true
    const saleDate = new Date(s.soldAt)
    if (dateFrom) matchDate = matchDate && saleDate >= new Date(dateFrom)
    if (dateTo) {
      const toDate = new Date(dateTo)
      toDate.setHours(23, 59, 59, 999)
      matchDate = matchDate && saleDate <= toDate
    }
    
    return matchSearch && matchType && matchStatus && matchDate
  })

  const totalRevenue = filteredSales.filter(s => !s.isReversed).reduce((sum, s) => sum + (s.salePrice * s.quantity), 0)
  const totalItems = filteredSales.filter(s => !s.isReversed).reduce((sum, s) => sum + s.quantity, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="col-span-2">
          <CardContent className="p-6 flex flex-col justify-center">
            <p className="text-sm font-medium text-slate-500">Ingresos Totales (Filtrados, Activas)</p>
            <p className="text-3xl font-bold text-slate-900">${totalRevenue.toLocaleString('es-MX', {minimumFractionDigits: 2})}</p>
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardContent className="p-6 flex flex-col justify-center">
            <p className="text-sm font-medium text-slate-500">Unidades Vendidas (Filtradas, Activas)</p>
            <p className="text-3xl font-bold text-slate-900">{totalItems}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4">
          <Input 
            placeholder="Buscar por nombre o SKU..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="sm:max-w-xs"
          />
          <Select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: "all", label: "Ambas tiendas" },
              { value: "bw", label: "Solo Betterware" },
              { value: "custom", label: "Solo Personal" }
            ]}
          />
          <Select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: "all", label: "Todas las ventas" },
              { value: "active", label: "Solo activas" },
              { value: "reversed", label: "Solo revertidas" }
            ]}
          />
          <div className="flex items-center gap-2">
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-36" title="Desde" />
            <span className="text-slate-400 text-sm">—</span>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-36" title="Hasta" />
            {(dateFrom || dateTo) && (
              <Button size="sm" variant="ghost" onClick={() => { setDateFrom(""); setDateTo("") }} title="Limpiar fechas">×</Button>
            )}
          </div>
        </div>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto min-h-[200px]">
            <table className="w-full text-sm text-left mb-32">
              <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3">Fecha</th>
                  <th className="px-6 py-3">Producto</th>
                  <th className="px-6 py-3">Tienda</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3 text-right">Precio Total</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-4 text-center text-slate-500">Cargando...</td></tr>
                ) : filteredSales.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-4 text-center text-slate-500">No se encontraron ventas</td></tr>
                ) : (
                  filteredSales.map((s) => (
                    <tr key={`${s.type}-${s.id}`} className={`hover:bg-slate-50 ${s.isReversed ? 'bg-red-50/50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(s.soldAt).toLocaleDateString('es-MX', {day: '2-digit', month: 'short', year: 'numeric'})}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{s.productName}</div>
                        {s.sku && <div className="text-xs text-slate-500 font-mono">SKU: {s.sku}</div>}
                        {s.quantity > 1 && <div className="text-xs text-slate-500">{s.quantity} unidades</div>}
                        {s.notes && <div className="text-xs text-slate-500 mt-1 italic">"{s.notes}"</div>}
                      </td>
                      <td className="px-6 py-4">
                        {s.type === 'bw' ? <Badge variant="secondary" className="bg-blue-100 text-blue-800">Betterware</Badge> : <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">Personal</Badge>}
                      </td>
                      <td className="px-6 py-4">
                        {s.isReversed ? <Badge variant="destructive">Revertida</Badge> : <Badge variant="success">Activa</Badge>}
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        ${(s.salePrice * s.quantity).toLocaleString('es-MX', {minimumFractionDigits: 2})}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!s.isReversed && (
                          <div className="relative inline-block">
                            <Button size="sm" variant="ghost" onClick={() => setActionMenuId(s.id)}>
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={actionModal === "edit"} onClose={() => setActionModal(null)} title="Editar Venta">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Editando detalles de venta para <strong>{selectedSale?.productName}</strong>.</p>
          <div className="space-y-2">
            <label className="text-sm font-medium">Precio de Venta Unitario</label>
            <Input type="number" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Notas</label>
            <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Agrega alguna nota a la venta..." />
          </div>
          <Button onClick={handleEdit} className="w-full">Guardar Cambios</Button>
        </div>
      </Modal>

      <Modal isOpen={actionModal === "revert"} onClose={() => setActionModal(null)} title="Revertir Venta">
        <div className="space-y-4">
          <div className="p-4 bg-red-50 text-red-800 rounded-md border border-red-200">
            <h4 className="font-bold mb-2">¡Cuidado!</h4>
            <p className="text-sm">Estás a punto de revertir la venta de <strong>{selectedSale?.productName}</strong>.</p>
            <ul className="list-disc list-inside mt-2 text-sm">
              <li>El producto volverá a estar disponible en el inventario.</li>
              <li>La venta se marcará como "revertida" en el historial pero no se borrará.</li>
              <li>Se restará del total de ingresos del mes.</li>
            </ul>
          </div>
          <Button variant="destructive" onClick={handleRevert} className="w-full">Confirmar Reversión</Button>
        </div>
      </Modal>

      <Modal isOpen={actionMenuId !== null} onClose={() => setActionMenuId(null)} title="Opciones de la Venta">
        {actionMenuId !== null && (() => {
          const s = sales.find(x => x.id === actionMenuId)
          if (!s) return null
          return (
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start h-12" onClick={() => { 
                setSelectedSale(s); 
                setEditPrice(s.salePrice.toString()); 
                setEditNotes(s.notes || ""); 
                setActionModal("edit"); 
                setActionMenuId(null);
              }}>Editar Venta</Button>
              <Button variant="outline" className="w-full justify-start h-12 text-red-600 border-red-200 hover:text-red-700 hover:bg-red-50" onClick={() => { 
                setSelectedSale(s); 
                setActionModal("revert"); 
                setActionMenuId(null);
              }}>Revertir Venta</Button>
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}
