"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import toast from "react-hot-toast"
import { Save, RefreshCw, AlertTriangle } from "lucide-react"

export function ConfigClient() {
  const [configs, setConfigs] = useState({
    store_name: "",
    whatsapp_maru: "",
    whatsapp_mosco: ""
  })
  const [loading, setLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const router = useRouter()
  
  const [resetConfirmText, setResetConfirmText] = useState("")
  const [isResetting, setIsResetting] = useState(false)

  useEffect(() => {
    fetch("/api/config")
      .then(r => r.json())
      .then(data => {
        setConfigs({
          store_name: data.store_name || "",
          whatsapp_maru: data.whatsapp_maru || "",
          whatsapp_mosco: data.whatsapp_mosco || ""
        })
        setLoading(false)
      })
  }, [])

  const handleSaveConfig = async () => {
    const toastId = toast.loading("Guardando configuración...")
    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        body: JSON.stringify(configs)
      })
      if (!res.ok) throw new Error()
      toast.success("Configuración guardada", { id: toastId })
    } catch {
      toast.error("Error al guardar", { id: toastId })
    }
  }

  const handleManualSync = async () => {
    setIsSyncing(true)
    const toastId = toast.loading("Sincronizando con Betterware...")
    try {
      const res = await fetch("/api/sync/catalog")
      if (!res.ok) throw new Error()
      const data = await res.json()
      toast.success(`Sync completada: ${data.created} nuevos, ${data.updated} actualizados`, { id: toastId })
      router.refresh()
    } catch {
      toast.error("Error en la sincronización", { id: toastId })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleResetInventory = async () => {
    if (resetConfirmText !== "REINICIAR") return
    
    setIsResetting(true)
    const toastId = toast.loading("Reiniciando inventario...")
    try {
      const res = await fetch("/api/inventory/reset", { method: "POST" })
      if (!res.ok) throw new Error()
      const data = await res.json()
      toast.success(`Inventario reiniciado: ${data.count} productos eliminados`, { id: toastId })
      setResetConfirmText("")
    } catch {
      toast.error("Error al reiniciar inventario", { id: toastId })
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información General</CardTitle>
          <CardDescription>Datos públicos de la tienda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre de la Tienda</label>
            <Input 
              value={configs.store_name}
              onChange={(e) => setConfigs({...configs, store_name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">WhatsApp de Maru</label>
              <Input 
                placeholder="Ej. 524774499628"
                value={configs.whatsapp_maru}
                onChange={(e) => setConfigs({...configs, whatsapp_maru: e.target.value})}
              />
              <p className="text-xs text-slate-500">Con código de país, sin +</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">WhatsApp de Mosco</label>
              <Input 
                placeholder="Ej. 524777240506"
                value={configs.whatsapp_mosco}
                onChange={(e) => setConfigs({...configs, whatsapp_mosco: e.target.value})}
              />
              <p className="text-xs text-slate-500">Con código de país, sin +</p>
            </div>
          </div>
          <Button onClick={handleSaveConfig} disabled={loading}>
            <Save className="w-4 h-4 mr-2" /> Guardar Configuración
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sincronización Betterware</CardTitle>
          <CardDescription>La sincronización se ejecuta automáticamente todos los días a las 3:00 AM CST. Puedes forzarla manualmente aquí.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleManualSync} disabled={isSyncing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} /> 
            {isSyncing ? "Sincronizando..." : "Sincronizar Ahora"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-red-200 bg-red-50/30">
        <CardHeader>
          <CardTitle className="text-red-700 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" /> Zona de Peligro: Reiniciar Inventario
          </CardTitle>
          <CardDescription className="text-red-600/80">
            Esta acción eliminará por completo todos los productos físicos de Betterware que estén en estado "Disponible". Los apartados y vendidos no se verán afectados.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-red-900">Escribe REINICIAR para confirmar</label>
            <Input 
              className="border-red-200 focus-visible:ring-red-500"
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              placeholder="REINICIAR"
            />
          </div>
          <Button 
            variant="destructive" 
            disabled={resetConfirmText !== "REINICIAR" || isResetting}
            onClick={handleResetInventory}
          >
            Confirmar Reinicio
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
