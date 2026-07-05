"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Modal } from "@/components/ui/Modal"
import { Badge } from "@/components/ui/Badge"
import toast from "react-hot-toast"
import { Plus, MoreHorizontal, UploadCloud } from "lucide-react"

type CustomProduct = {
  id: number
  name: string
  description: string | null
  price: string
  stock: number
  reservedCount: number
  soldCount: number
  images: string[]
  category: string | null
  isActive: boolean
}

export function TiendaClient() {
  const [products, setProducts] = useState<CustomProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  // Form State
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("1")
  const [category, setCategory] = useState("")
  const [isNewCategory, setIsNewCategory] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)

  // Action State
  const [actionModal, setActionModal] = useState<"reserve" | "sell" | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<CustomProduct | null>(null)
  const [actionQuantity, setActionQuantity] = useState("1")
  const [actionPrice, setActionPrice] = useState("")
  const [sellSource, setSellSource] = useState<"available" | "reserved">("available")

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/custom-products")
      const data = await res.json()
      setProducts(data.filter((p: any) => p.isActive))
    } catch {
      toast.error("Error al cargar productos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [])

  const resetForm = () => {
    setEditingId(null)
    setName("")
    setDescription("")
    setPrice("")
    setStock("1")
    setCategory("")
    setIsNewCategory(false)
    setImages([])
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    
    setIsUploading(true)
    const toastId = toast.loading("Subiendo imagen...")
    
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setImages(prev => [...prev, data.url])
      toast.success("Imagen subida", { id: toastId })
    } catch {
      toast.error("Error al subir", { id: toastId })
    } finally {
      setIsUploading(false)
      e.target.value = "" // reset input
    }
  }

  const handleSaveProduct = async () => {
    if (!name || !price) return toast.error("Nombre y precio requeridos")
    const toastId = toast.loading("Guardando...")
    
    const data = { name, description, price, stock, category, images }
    
    try {
      const method = editingId ? "PUT" : "POST"
      const url = editingId ? `/api/custom-products/${editingId}` : "/api/custom-products"
      const res = await fetch(url, { method, body: JSON.stringify(data) })
      if (!res.ok) throw new Error()
      toast.success("Producto guardado", { id: toastId })
      setIsFormOpen(false)
      fetchProducts()
    } catch {
      toast.error("Error al guardar", { id: toastId })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este producto?")) return
    const toastId = toast.loading("Eliminando...")
    try {
      const res = await fetch(`/api/custom-products/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Eliminado", { id: toastId })
      fetchProducts()
    } catch {
      toast.error("Error al eliminar", { id: toastId })
    }
  }

  const handleDeleteCategory = async (categoryName: string) => {
    if (!confirm(`¿Eliminar la categoría "${categoryName}"? Los productos que la tengan quedarán sin categoría.`)) return
    const toastId = toast.loading("Eliminando categoría...")
    try {
      const res = await fetch(`/api/custom-products/category?name=${encodeURIComponent(categoryName)}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Categoría eliminada", { id: toastId })
      if (filterCategory === categoryName) setFilterCategory("all")
      fetchProducts()
    } catch {
      toast.error("Error al eliminar", { id: toastId })
    }
  }

  const handleReserve = async () => {
    if (!selectedProduct) return
    const q = parseInt(actionQuantity)
    if (q > selectedProduct.stock) return toast.error("No hay suficiente stock disponible")
    
    const toastId = toast.loading("Apartando...")
    try {
      const res = await fetch(`/api/custom-products/${selectedProduct.id}`, {
        method: "PUT",
        body: JSON.stringify({ 
          stock: selectedProduct.stock - q,
          reservedCount: selectedProduct.reservedCount + q
        })
      })
      if (!res.ok) throw new Error()
      toast.success("Apartado exitoso", { id: toastId })
      setActionModal(null)
      fetchProducts()
    } catch {
      toast.error("Error al apartar", { id: toastId })
    }
  }

  const handleSell = async () => {
    if (!selectedProduct) return
    const q = parseInt(actionQuantity)
    if (sellSource === "available" && q > selectedProduct.stock) return toast.error("No hay suficiente stock")
    if (sellSource === "reserved" && q > selectedProduct.reservedCount) return toast.error("No hay suficientes apartados")
    
    const toastId = toast.loading("Registrando venta...")
    try {
      const res = await fetch(`/api/sales/custom`, {
        method: "POST",
        body: JSON.stringify({
          customProductId: selectedProduct.id,
          quantity: q,
          salePrice: actionPrice ? Number(actionPrice) : Number(selectedProduct.price),
          action: sellSource === 'available' ? 'sell_available' : 'sell_reserved'
        })
      })
      if (!res.ok) throw new Error()
      toast.success("Venta registrada", { id: toastId })
      setActionModal(null)
      fetchProducts()
    } catch {
      toast.error("Error al vender", { id: toastId })
    }
  }

  const existingCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort() as string[]

  const filtered = products.filter(p => {
    if (filterCategory !== "all" && p.category !== filterCategory) return false
    return p.name.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <Card>
      <div className="p-4 border-b flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-2 flex-1 max-w-lg">
          <Input 
            placeholder="Buscar producto..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="all">Todas las categorías</option>
            {existingCategories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          {existingCategories.length > 0 && (
            <Button variant="outline" onClick={() => setIsCategoryModalOpen(true)}>
              Ver Categorías
            </Button>
          )}
          <Button onClick={() => { 
            resetForm(); 
            if (existingCategories.length > 0) {
              setCategory(existingCategories[0])
            } else {
              setIsNewCategory(true)
            }
            setIsFormOpen(true) 
          }}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
          </Button>
        </div>
      </div>

      <CardContent className="p-0">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-sm text-left mb-32">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-3">Producto</th>
                <th className="px-6 py-3">Categoría</th>
                <th className="px-6 py-3">Precio</th>
                <th className="px-6 py-3 text-center">Disp.</th>
                <th className="px-6 py-3 text-center">Apar.</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-slate-500">Cargando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-slate-500">No se encontraron productos</td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {p.images[0] ? (
                          <img src={p.images[0]} alt="" className="w-10 h-10 object-cover rounded-md border" />
                        ) : (
                          <div className="w-10 h-10 bg-slate-100 rounded-md border flex items-center justify-center text-xs text-slate-400">IMG</div>
                        )}
                        <span className="font-medium text-slate-900">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{p.category || "—"}</td>
                    <td className="px-6 py-4 font-medium">${Number(p.price).toFixed(2)}</td>
                    <td className="px-6 py-4 text-center"><Badge variant="success">{p.stock}</Badge></td>
                    <td className="px-6 py-4 text-center"><Badge variant="warning">{p.reservedCount}</Badge></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {p.stock > 0 && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => { setSelectedProduct(p); setActionQuantity("1"); setActionModal("reserve") }}>Apartar</Button>
                            <Button size="sm" variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => { setSelectedProduct(p); setActionQuantity("1"); setActionPrice(""); setSellSource("available"); setActionModal("sell") }}>Vender</Button>
                          </>
                        )}
                        {p.reservedCount > 0 && p.stock === 0 && (
                          <Button size="sm" variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => { setSelectedProduct(p); setActionQuantity("1"); setActionPrice(""); setSellSource("reserved"); setActionModal("sell") }}>Vender Apartado</Button>
                        )}
                        
                        <div className="relative group inline-block">
                          <Button size="sm" variant="ghost"><MoreHorizontal className="w-4 h-4" /></Button>
                          <div className="absolute right-0 top-full pt-1 hidden group-hover:block z-10 w-40">
                            <div className="bg-white border rounded-md shadow-lg text-left py-1">
                              {p.reservedCount > 0 && p.stock > 0 && (
                                <button className="w-full px-4 py-2 text-sm text-left hover:bg-slate-50" onClick={() => { setSelectedProduct(p); setActionQuantity("1"); setActionPrice(""); setSellSource("reserved"); setActionModal("sell") }}>Vender Apartado</button>
                              )}
                              <button className="w-full px-4 py-2 text-sm text-left hover:bg-slate-50" onClick={() => {
                                setEditingId(p.id)
                                setName(p.name)
                                setDescription(p.description || "")
                                setPrice(p.price)
                                setStock(p.stock.toString())
                                setCategory(p.category || "")
                                if (p.category && !existingCategories.includes(p.category)) {
                                  setIsNewCategory(true)
                                } else {
                                  setIsNewCategory(false)
                                }
                                setImages(p.images)
                                setIsFormOpen(true)
                              }}>Editar Producto</button>
                              <button className="w-full px-4 py-2 text-sm text-left hover:bg-slate-50 text-red-600" onClick={() => handleDelete(p.id)}>Eliminar</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingId ? "Editar Producto" : "Nuevo Producto Personal"} className="sm:max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2 sm:col-span-1">
            <label className="text-sm font-medium">Nombre</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Termo Yeti" />
          </div>
          <div className="space-y-2 col-span-2 sm:col-span-1">
            <label className="text-sm font-medium">Categoría</label>
            {isNewCategory || existingCategories.length === 0 ? (
              <div className="flex gap-2">
                <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Nueva categoría" />
                {existingCategories.length > 0 && (
                  <Button type="button" variant="outline" onClick={() => { setIsNewCategory(false); setCategory(existingCategories[0]) }}>X</Button>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {existingCategories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <Button type="button" variant="outline" onClick={() => { setIsNewCategory(true); setCategory("") }}>Nueva</Button>
              </div>
            )}
          </div>
          <div className="space-y-2 col-span-2 sm:col-span-1">
            <label className="text-sm font-medium">Precio Final</label>
            <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
          </div>
          <div className="space-y-2 col-span-2 sm:col-span-1">
            <label className="text-sm font-medium">Stock Inicial</label>
            <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} min="0" />
          </div>
          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium">Descripción</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2 col-span-2 border rounded-md p-4 bg-slate-50">
            <label className="text-sm font-medium flex items-center justify-between">
              Imágenes
              <label className="cursor-pointer bg-white border px-3 py-1.5 rounded text-sm hover:bg-slate-100 flex items-center gap-2">
                <UploadCloud className="w-4 h-4" /> Subir Imagen
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
              </label>
            </label>
            <div className="flex gap-2 flex-wrap mt-3">
              {images.map((url, i) => (
                <div key={i} className="relative group">
                  <img src={url} alt="" className="w-20 h-20 object-cover border rounded bg-white" />
                  <button 
                    onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100"
                  >×</button>
                </div>
              ))}
              {images.length === 0 && <p className="text-xs text-slate-500">No hay imágenes. El producto se verá mejor con una.</p>}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSaveProduct}>Guardar Producto</Button>
        </div>
      </Modal>

      <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title="Administrar Categorías">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Aquí puedes eliminar las categorías que ya no necesites. Los productos asociados quedarán "Sin categoría".</p>
          {existingCategories.length === 0 ? (
            <p className="text-sm text-slate-500 italic">No hay categorías registradas.</p>
          ) : (
            <ul className="space-y-2">
              {existingCategories.map(c => (
                <li key={c} className="flex items-center justify-between p-3 bg-slate-50 border rounded-md">
                  <span className="font-medium">{c}</span>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteCategory(c)}>
                    Eliminar
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Modal>

      <Modal isOpen={actionModal === "reserve"} onClose={() => setActionModal(null)} title="Apartar Stock">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">¿Cuántas unidades de <strong>{selectedProduct?.name}</strong> deseas apartar?</p>
          <Input type="number" min="1" max={selectedProduct?.stock} value={actionQuantity} onChange={(e) => setActionQuantity(e.target.value)} />
          <Button onClick={handleReserve} className="w-full">Confirmar Apartado</Button>
        </div>
      </Modal>

      <Modal isOpen={actionModal === "sell"} onClose={() => setActionModal(null)} title="Registrar Venta">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Venta de <strong>{selectedProduct?.name}</strong> (Tomando del stock {sellSource === 'available' ? 'disponible' : 'apartado'})
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cantidad</label>
              <Input type="number" min="1" max={sellSource === 'available' ? selectedProduct?.stock : selectedProduct?.reservedCount} value={actionQuantity} onChange={(e) => setActionQuantity(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Precio (Opcional)</label>
              <Input type="number" step="0.01" placeholder={selectedProduct?.price} value={actionPrice} onChange={(e) => setActionPrice(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleSell} className="w-full bg-green-600 hover:bg-green-700">Confirmar Venta</Button>
        </div>
      </Modal>
    </Card>
  )
}
