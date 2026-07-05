"use client"

import { useEffect, useState, useRef } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Modal } from "@/components/ui/Modal"
import { Select } from "@/components/ui/Select"
import toast from "react-hot-toast"
import { Check, X, ScanBarcode } from "lucide-react"

export function ScannerClient() {
  const [locations, setLocations] = useState<{id: number, name: string}[]>([])
  const [scannedProduct, setScannedProduct] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [locationId, setLocationId] = useState(() => {
    // Persist location selection
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lastLocationId') || "null"
    }
    return "null"
  })
  const [sessionCount, setSessionCount] = useState(0)
  const [scannerError, setScannerError] = useState<string | null>(null)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  useEffect(() => {
    fetch("/api/locations").then(r => r.json()).then(setLocations)
  }, [])

  useEffect(() => {
    if (!scannerRef.current) {
      try {
        const scanner = new Html5QrcodeScanner(
          "reader", 
          { fps: 10, qrbox: { width: 250, height: 100 } }, 
          false
        )
        scannerRef.current = scanner
        scanner.render(onScanSuccess, onScanFailure)
      } catch (err: any) {
        setScannerError("No se pudo iniciar la cámara. Asegúrate de tener permisos o usa el registro manual.")
      }
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {})
      }
    }
  }, [])

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = "sine"
      osc.frequency.value = 1000 // 1kHz beep
      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.01)
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.15)
    } catch (e) {
      // AudioContext not supported
    }
  }

  const vibrate = () => {
    if (navigator.vibrate) navigator.vibrate(200)
  }

  async function onScanSuccess(decodedText: string) {
    // Only process 5-digit strings that look like SKUs
    if (decodedText.length === 5 && /^\d+$/.test(decodedText)) {
      if (isModalOpen) return // Don't process if a modal is already open

      playBeep()
      vibrate()

      if (scannerRef.current) {
        scannerRef.current.pause(true)
      }

      toast.loading(`Buscando SKU ${decodedText}...`, { id: 'scan-search' })

      try {
        const res = await fetch(`/api/products/${decodedText}`)
        if (res.ok) {
          const product = await res.json()
          toast.dismiss('scan-search')
          setScannedProduct(product)
          setIsModalOpen(true)
        } else {
          toast.error(`Error: SKU ${decodedText} no encontrado en el catálogo`, { id: 'scan-search' })
          resumeScanner()
        }
      } catch {
        toast.error(`Error de red al buscar SKU ${decodedText}`, { id: 'scan-search' })
        resumeScanner()
      }
    }
  }

  function onScanFailure(error: any) {
    // Ignore frequent scan failures (e.g. no code detected yet)
  }

  const resumeScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.resume()
    }
  }

  const handleConfirm = async () => {
    if (!scannedProduct) return
    const toastId = toast.loading("Registrando producto...")

    // Persist selected location
    localStorage.setItem('lastLocationId', locationId)

    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        body: JSON.stringify({
          sku: scannedProduct.sku,
          locationId: locationId === "null" ? null : parseInt(locationId),
          quantity: 1
        })
      })

      if (!res.ok) throw new Error()
      
      toast.success("✅ Producto registrado correctamente", { id: toastId })
      setSessionCount(prev => prev + 1)
      setIsModalOpen(false)
      setScannedProduct(null)
      resumeScanner()
    } catch {
      toast.error("Error al registrar", { id: toastId })
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    setScannedProduct(null)
    resumeScanner()
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm font-medium text-slate-500">Escaneados en esta sesión: <span className="text-slate-900 font-bold">{sessionCount}</span></p>
          </div>
          
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-black relative">
            {scannerError && (
              <div className="absolute inset-0 z-10 bg-slate-900/90 flex items-center justify-center p-6 text-center">
                <p className="text-white font-medium">{scannerError}</p>
              </div>
            )}
            <div id="reader" className="w-full bg-slate-100" style={{ minHeight: '300px' }}></div>
          </div>
        </CardContent>
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCancel} 
        title="Confirmar Registro"
      >
        {scannedProduct && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-slate-50">
              {scannedProduct.images[0] && (
                <img src={scannedProduct.images[0].src} alt="" className="w-20 h-20 object-cover rounded-md border bg-white" />
              )}
              <div>
                <h4 className="font-medium text-lg text-slate-900">{scannedProduct.title}</h4>
                <p className="text-slate-500 font-mono">SKU: {scannedProduct.sku}</p>
                <p className="font-semibold text-slate-900 mt-1">${Number(scannedProduct.priceBetterware).toFixed(2)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ubicación de destino</label>
              <Select 
                value={locationId} 
                onChange={(e) => setLocationId(e.target.value)}
                options={[
                  { value: "null", label: "Sin ubicación" },
                  ...locations.map(l => ({ value: l.id.toString(), label: l.name }))
                ]}
              />
              <p className="text-xs text-slate-500">Esta ubicación se recordará para el próximo producto.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={handleCancel} className="w-full">
                <X className="mr-2 h-4 w-4" /> Cancelar
              </Button>
              <Button onClick={handleConfirm} className="w-full">
                <Check className="mr-2 h-4 w-4" /> Confirmar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
