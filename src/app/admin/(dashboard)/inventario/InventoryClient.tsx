"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Modal } from "@/components/ui/Modal"
import toast from "react-hot-toast"
import { MoreHorizontal, AlertCircle, Edit, MapPin, ExternalLink, Download } from "lucide-react"

type InventoryUnit = {
  id: number
  status: string
  customPrice: string | null
  catalogProduct: {
    sku: string
    title: string
    images: { src: string }[]
    priceBetterware: string
    compareAtPrice: string | null
    tags: string[]
    productType: string
  }
  location: { id: number; name: string } | null
}

export function InventoryClient() {
  const [units, setUnits] = useState<InventoryUnit[]>([])
  const [locations, setLocations] = useState<{ id: number; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")
  const [specialFilter, setSpecialFilter] = useState("all") // custom_price, red_price

  // Modals
  const [selectedUnit, setSelectedUnit] = useState<InventoryUnit | null>(null)
  const [actionModal, setActionModal] = useState<"sell" | "location" | "price" | null>(null)
  const [actionMenuId, setActionMenuId] = useState<number | null>(null)
  
  // Form states
  const [sellPrice, setSellPrice] = useState("")
  const [newLocationId, setNewLocationId] = useState("")
  const [customPrice, setCustomPrice] = useState("")

  const fetchData = async () => {
    try {
      const [unitsRes, locsRes] = await Promise.all([
        fetch("/api/inventory"),
        fetch("/api/locations")
      ])
      const unitsData = await unitsRes.json()
      const locsData = await locsRes.json()
      setUnits(unitsData)
      setLocations(locsData)
    } catch (e) {
      toast.error("Error al cargar datos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    const toastId = toast.loading("Actualizando estado...")
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Estado actualizado a ${newStatus}`, { id: toastId })
      fetchData()
    } catch {
      toast.error("Error al actualizar", { id: toastId })
    }
  }

  const handleDeleteUnit = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto del inventario? Esta acción no se puede deshacer.")) return
    const toastId = toast.loading("Eliminando...")
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Producto eliminado", { id: toastId })
      fetchData()
    } catch {
      toast.error("Error al eliminar", { id: toastId })
    }
  }

  const handleSell = async () => {
    if (!selectedUnit) return
    const toastId = toast.loading("Registrando venta...")
    try {
      // If sellPrice is empty, calculate the default display price
      let finalPrice = sellPrice
      if (!finalPrice) {
        if (selectedUnit.customPrice) {
          finalPrice = selectedUnit.customPrice
        } else {
          const cp = selectedUnit.catalogProduct
          if (cp.compareAtPrice) {
            finalPrice = Math.min(Number(cp.priceBetterware), Number(cp.compareAtPrice)).toString()
          } else {
            finalPrice = cp.priceBetterware
          }
        }
      }

      const res = await fetch(`/api/inventory/${selectedUnit.id}`, {
        method: "PUT",
        body: JSON.stringify({ status: "sold", salePrice: finalPrice }),
      })
      if (!res.ok) throw new Error()
      toast.success("Venta registrada", { id: toastId })
      setActionModal(null)
      fetchData()
    } catch {
      toast.error("Error al registrar venta", { id: toastId })
    }
  }

  const handleChangeLocation = async () => {
    if (!selectedUnit) return
    const toastId = toast.loading("Cambiando ubicación...")
    try {
      const res = await fetch(`/api/inventory/${selectedUnit.id}`, {
        method: "PUT",
        body: JSON.stringify({ locationId: newLocationId === "null" ? null : parseInt(newLocationId) }),
      })
      if (!res.ok) throw new Error()
      toast.success("Ubicación cambiada", { id: toastId })
      setActionModal(null)
      fetchData()
    } catch {
      toast.error("Error al cambiar ubicación", { id: toastId })
    }
  }

  const handleSetCustomPrice = async () => {
    if (!selectedUnit) return
    const toastId = toast.loading("Guardando precio...")
    try {
      const res = await fetch(`/api/inventory/${selectedUnit.id}`, {
        method: "PUT",
        body: JSON.stringify({ customPrice: customPrice.trim() === "" ? null : customPrice }),
      })
      if (!res.ok) throw new Error()
      toast.success("Precio actualizado", { id: toastId })
      setActionModal(null)
      fetchData()
    } catch {
      toast.error("Error al actualizar precio", { id: toastId })
    }
  }

  const isRedPrice = (tags: string[], compareAtPrice: string | null) => {
    // Si el sistema ya detectó el precio original (compareAtPrice), entonces no necesitamos advertencia.
    if (compareAtPrice) return false;

    // Si no tenemos compareAtPrice, usamos las etiquetas para ver si es una oferta oculta
    const hasRedTag = tags.some(t => {
      const tl = t.toLowerCase().trim();
      return tl === "disponible-oferta" || 
             tl === "superprecio" || 
             tl === "hiperoferta" || 
             tl === "megaoferta_3n" || 
             tl === "oferta_por_monto" || 
             tl === "precio rojo" || 
             tl === "2_o_mas" ||
             tl.includes("badge:mega oferta") ||
             tl.includes("badge:casita");
    });
    return hasRedTag;
  }

  const filteredUnits = units.filter(u => {
    const matchSearch = u.catalogProduct.title.toLowerCase().includes(search.toLowerCase()) || 
                        u.catalogProduct.sku.includes(search)
    const matchStatus = statusFilter === "all" || u.status === statusFilter
    const matchLocation = locationFilter === "all" || 
                          (locationFilter === "none" && !u.location) ||
                          (u.location && u.location.id.toString() === locationFilter)
    
    let matchSpecial = true
    if (specialFilter === "custom_price") matchSpecial = !!u.customPrice
    if (specialFilter === "red_price") matchSpecial = isRedPrice(u.catalogProduct.tags, u.catalogProduct.compareAtPrice)

    return matchSearch && matchStatus && matchLocation && matchSpecial
  })

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'available': return <Badge variant="success">Disponible</Badge>
      case 'reserved': return <Badge variant="warning">Apartado</Badge>
      case 'sold': return <Badge variant="default">Vendido</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

  return (
    <Card>
      <div className="p-4 border-b space-y-4">
        <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
          <div className="flex flex-col sm:flex-row gap-4 flex-wrap w-full">
            <Input 
              placeholder="Buscar por nombre o SKU..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="sm:max-w-xs"
          />
          <Select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: "all", label: "Todos los estados" },
              { value: "available", label: "Disponible" },
              { value: "reserved", label: "Apartado" },
              { value: "sold", label: "Vendido" },
            ]}
          />
          <Select 
            value={locationFilter} 
            onChange={(e) => setLocationFilter(e.target.value)}
            options={[
              { value: "all", label: "Todas las ubicaciones" },
              { value: "none", label: "Sin ubicación" },
              ...locations.map(l => ({ value: l.id.toString(), label: l.name }))
            ]}
          />
          <Select 
            value={specialFilter} 
            onChange={(e) => setSpecialFilter(e.target.value)}
            options={[
              { value: "all", label: "Sin filtro especial" },
              { value: "custom_price", label: "Con precio personalizado" },
              { value: "red_price", label: "Precio rojo (verificar)" },
            ]}
          />
          </div>
          <Button variant="outline" onClick={() => window.open('/api/inventory/export', '_blank')} className="shrink-0 whitespace-nowrap bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800">
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-sm text-left mb-32">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-3">Producto</th>
                <th className="px-6 py-3">SKU</th>
                <th className="px-6 py-3 text-center">Enlace</th>
                <th className="px-6 py-3">Ubicación</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Precio</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-slate-500">Cargando...</td></tr>
              ) : filteredUnits.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-slate-500">No se encontraron productos</td></tr>
              ) : (
                filteredUnits.map((u) => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {u.catalogProduct.images[0] && (
                          <img src={u.catalogProduct.images[0].src} alt="" className="w-10 h-10 object-cover rounded-md border" />
                        )}
                        <span className="font-medium text-slate-900">{u.catalogProduct.title}</span>
                        {isRedPrice(u.catalogProduct.tags, u.catalogProduct.compareAtPrice) && (
                          <div className="relative group/badge">
                            <AlertCircle className="w-4 h-4 text-red-500 cursor-help" />
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/badge:block w-48 bg-gray-900 text-white text-xs text-center p-2 rounded-lg shadow-xl z-50">
                              Este producto tiene una oferta que cambia el precio al comprar varios productos
                              <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{u.catalogProduct.sku}</td>
                    <td className="px-6 py-4 text-center">
                      <a 
                        href={`https://betterware.com.mx/products/${u.catalogProduct.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/['"]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}-${u.catalogProduct.sku}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver en Betterware"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{u.location?.name || "—"}</td>
                    <td className="px-6 py-4">{getStatusBadge(u.status)}</td>
                    <td className="px-6 py-4">
                      {u.customPrice ? (
                        <div className="flex flex-col">
                          <span className="font-medium">${Number(u.customPrice).toFixed(2)}</span>
                          <Badge variant="secondary" className="w-fit text-[10px] px-1 py-0 h-4">Manual</Badge>
                        </div>
                      ) : (
                        <span>${Number(u.catalogProduct.priceBetterware).toFixed(2)}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {u.status === 'available' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(u.id, 'reserved')}>Apartar</Button>
                            <Button size="sm" variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => { setSelectedUnit(u); setSellPrice(""); setActionModal("sell") }}>Vender</Button>
                          </>
                        )}
                        {u.status === 'reserved' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(u.id, 'available')}>Devolver</Button>
                            <Button size="sm" variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => { setSelectedUnit(u); setSellPrice(""); setActionModal("sell") }}>Vender</Button>
                          </>
                        )}
                        {u.status !== 'sold' && u.status !== 'withdrawn' && (
                          <div className="relative inline-block">
                            <Button size="sm" variant="ghost" onClick={() => setActionMenuId(u.id)}>
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      {/* Sell Modal */}
      <Modal isOpen={actionModal === "sell"} onClose={() => setActionModal(null)} title="Vender Producto">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Confirma la venta de <strong>{selectedUnit?.catalogProduct.title}</strong>.</p>
          <div className="space-y-2">
            <label className="text-sm font-medium">Precio de venta final (opcional)</label>
            <Input 
              type="number" 
              step="0.01" 
              placeholder="Ej. 199.90" 
              value={sellPrice} 
              onChange={(e) => setSellPrice(e.target.value)} 
            />
            <p className="text-xs text-slate-500">Si se deja vacío, se usará el precio configurado.</p>
          </div>
          <Button onClick={handleSell} className="w-full bg-green-600 hover:bg-green-700">Confirmar Venta</Button>
        </div>
      </Modal>

      {/* Location Modal */}
      <Modal isOpen={actionModal === "location"} onClose={() => setActionModal(null)} title="Cambiar Ubicación">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Selecciona la nueva ubicación para <strong>{selectedUnit?.catalogProduct.title}</strong>.</p>
          <Select 
            value={newLocationId} 
            onChange={(e) => setNewLocationId(e.target.value)}
            options={[
              { value: "null", label: "Sin ubicación" },
              ...locations.map(l => ({ value: l.id.toString(), label: l.name }))
            ]}
          />
          <Button onClick={handleChangeLocation} className="w-full">Guardar Ubicación</Button>
        </div>
      </Modal>

      {/* Price Modal */}
      <Modal isOpen={actionModal === "price"} onClose={() => setActionModal(null)} title="Precio Personalizado">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Establece un precio manual para <strong>{selectedUnit?.catalogProduct.title}</strong>. Esto sobreescribe el precio de catálogo.</p>
          <Input 
            type="number" 
            step="0.01" 
            placeholder="Ej. 150.00" 
            value={customPrice} 
            onChange={(e) => setCustomPrice(e.target.value)} 
          />
          <p className="text-xs text-slate-500">Deja en blanco para usar el precio automático de Betterware.</p>
          <Button onClick={handleSetCustomPrice} className="w-full">Guardar Precio</Button>
        </div>
      </Modal>

      {/* Action Menu Modal */}
      <Modal isOpen={actionMenuId !== null} onClose={() => setActionMenuId(null)} title="Opciones del Producto">
        {actionMenuId !== null && (() => {
          const u = units.find(x => x.id === actionMenuId)
          if (!u) return null
          return (
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start h-12" onClick={() => { setSelectedUnit(u); setNewLocationId(u.location?.id?.toString() || "null"); setActionModal("location"); setActionMenuId(null); }}>Cambiar ubicación</Button>
              <Button variant="outline" className="w-full justify-start h-12" onClick={() => { setSelectedUnit(u); setCustomPrice(u.customPrice || ""); setActionModal("price"); setActionMenuId(null); }}>Editar precio manual</Button>
              {u.status === 'available' && (
                <Button variant="outline" className="w-full justify-start h-12 text-red-600 border-red-200 hover:text-red-700 hover:bg-red-50" onClick={() => { handleDeleteUnit(u.id); setActionMenuId(null); }}>Eliminar del Inventario</Button>
              )}
            </div>
          )
        })()}
      </Modal>
    </Card>
  )
}
