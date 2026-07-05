"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Modal } from "@/components/ui/Modal"
import { Select } from "@/components/ui/Select"
import toast from "react-hot-toast"
import { Edit2, Trash2, Plus } from "lucide-react"

type Location = {
  id: number
  name: string
  sortOrder: number
  _count: { units: number }
}

export function LocationsClient() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null)
  const [nameInput, setNameInput] = useState("")
  const [reassignOption, setReassignOption] = useState<string>("null")

  const fetchLocations = async () => {
    try {
      const res = await fetch("/api/locations")
      const data = await res.json()
      setLocations(data)
    } catch (e) {
      toast.error("Error al cargar ubicaciones")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLocations()
  }, [])

  const handleCreate = async () => {
    if (!nameInput.trim()) return
    const toastId = toast.loading("Guardando...")
    try {
      const res = await fetch("/api/locations", {
        method: "POST",
        body: JSON.stringify({ name: nameInput }),
      })
      if (!res.ok) throw new Error()
      toast.success("Ubicación creada", { id: toastId })
      setIsCreateOpen(false)
      setNameInput("")
      fetchLocations()
    } catch {
      toast.error("Error al crear", { id: toastId })
    }
  }

  const handleEdit = async () => {
    if (!nameInput.trim() || !currentLocation) return
    const toastId = toast.loading("Actualizando...")
    try {
      const res = await fetch(`/api/locations/${currentLocation.id}`, {
        method: "PUT",
        body: JSON.stringify({ name: nameInput }),
      })
      if (!res.ok) throw new Error()
      toast.success("Ubicación actualizada", { id: toastId })
      setIsEditOpen(false)
      fetchLocations()
    } catch {
      toast.error("Error al actualizar", { id: toastId })
    }
  }

  const handleDelete = async () => {
    if (!currentLocation) return
    const toastId = toast.loading("Eliminando...")
    try {
      const body = currentLocation._count.units > 0 
        ? { reassignToId: reassignOption === "null" ? null : parseInt(reassignOption) }
        : {}
        
      const res = await fetch(`/api/locations/${currentLocation.id}`, {
        method: "DELETE",
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error()
      toast.success("Ubicación eliminada", { id: toastId })
      setIsDeleteOpen(false)
      fetchLocations()
    } catch {
      toast.error("Error al eliminar", { id: toastId })
    }
  }

  const reassignOptions = [
    { value: "null", label: "Dejar items sin ubicación" },
    ...locations
      .filter(l => l.id !== currentLocation?.id)
      .map(l => ({ value: l.id.toString(), label: `Mover a: ${l.name}` }))
  ]

  return (
    <Card>
      <div className="p-6 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">Ubicaciones Configuradas</h3>
        <Button onClick={() => { setNameInput(""); setIsCreateOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" /> Nueva
        </Button>
      </div>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 text-center text-slate-500">Cargando...</div>
        ) : locations.length === 0 ? (
          <div className="p-6 text-center text-slate-500">No hay ubicaciones creadas.</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {locations.map((loc) => (
              <li key={loc.id} className="flex items-center justify-between p-4 hover:bg-slate-50">
                <div>
                  <p className="font-medium text-slate-900">{loc.name}</p>
                  <p className="text-sm text-slate-500">{loc._count.units} productos asignados</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setCurrentLocation(loc)
                      setNameInput(loc.name)
                      setIsEditOpen(true)
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      setCurrentLocation(loc)
                      setReassignOption("null")
                      setIsDeleteOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Nueva Ubicación">
        <div className="space-y-4">
          <Input 
            placeholder="Ej. Caja 1, Estante Superior" 
            value={nameInput} 
            onChange={(e) => setNameInput(e.target.value)} 
          />
          <Button onClick={handleCreate} className="w-full">Guardar Ubicación</Button>
        </div>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Editar Ubicación">
        <div className="space-y-4">
          <Input 
            value={nameInput} 
            onChange={(e) => setNameInput(e.target.value)} 
          />
          <Button onClick={handleEdit} className="w-full">Actualizar Ubicación</Button>
        </div>
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Eliminar Ubicación">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            ¿Estás seguro de eliminar <strong>{currentLocation?.name}</strong>?
          </p>
          
          {(currentLocation?._count.units || 0) > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-sm font-medium text-amber-900 mb-2">
                ¡Atención! Hay {currentLocation?._count.units} productos en esta ubicación.
              </p>
              <Select 
                options={reassignOptions} 
                value={reassignOption} 
                onChange={(e) => setReassignOption(e.target.value)}
              />
            </div>
          )}
          
          <Button variant="destructive" onClick={handleDelete} className="w-full">Confirmar Eliminación</Button>
        </div>
      </Modal>
    </Card>
  )
}
