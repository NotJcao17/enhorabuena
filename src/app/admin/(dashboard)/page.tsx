import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { Package, Store, DollarSign, TrendingUp, ScanBarcode, PlusSquare, LayoutDashboard } from "lucide-react"

export default async function AdminDashboard() {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  // BW Stats
  const bwAvailable = await prisma.inventoryUnit.count({ where: { status: 'available' } })
  const bwReserved = await prisma.inventoryUnit.count({ where: { status: 'reserved' } })
  const bwSoldThisMonth = await prisma.inventoryUnit.count({
    where: { 
      status: 'sold', 
      soldAt: { gte: startOfMonth },
      saleReversed: false
    }
  })

  // Calculate BW Inventory Value
  const availableBwUnits = await prisma.inventoryUnit.findMany({
    where: { status: 'available' },
    include: { catalogProduct: true }
  })

  const bwInventoryValue = availableBwUnits.reduce((sum, unit) => {
    if (unit.customPrice) {
      return sum + Number(unit.customPrice)
    }
    const cp = unit.catalogProduct
    if (cp.compareAtPrice) {
      return sum + Math.min(Number(cp.priceBetterware), Number(cp.compareAtPrice))
    }
    return sum + Number(cp.priceBetterware)
  }, 0)

  const bwSalesThisMonthUnits = await prisma.inventoryUnit.findMany({
    where: { status: 'sold', soldAt: { gte: startOfMonth }, saleReversed: false },
    include: { catalogProduct: true }
  })

  const bwRevenueThisMonth = bwSalesThisMonthUnits.reduce((sum, unit) => {
    return sum + Number(unit.salePrice || unit.customPrice || unit.catalogProduct.priceBetterware)
  }, 0)

  // Personal Store Stats
  const customProducts = await prisma.customProduct.findMany({
    where: { isActive: true }
  })

  const tpAvailable = customProducts.reduce((sum, p) => sum + p.stock, 0)
  const tpReserved = customProducts.reduce((sum, p) => sum + p.reservedCount, 0)
  const tpInventoryValue = customProducts.reduce((sum, p) => sum + (p.stock * Number(p.price)), 0)

  const tpSalesThisMonth = await prisma.customSaleRecord.findMany({
    where: { soldAt: { gte: startOfMonth }, reversed: false }
  })

  const tpSoldThisMonth = tpSalesThisMonth.reduce((sum, s) => sum + s.quantity, 0)
  const tpRevenueThisMonth = tpSalesThisMonth.reduce((sum, s) => sum + (s.quantity * Number(s.salePrice)), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <Link href="/admin/escanear" className="flex flex-col items-center gap-2 p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all group">
          <ScanBarcode className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium text-slate-700">Escanear</span>
        </Link>
        <Link href="/admin/inventario" className="flex flex-col items-center gap-2 p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all group">
          <Package className="h-8 w-8 text-slate-600 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium text-slate-700">Inventario</span>
        </Link>
        <Link href="/admin/registrar" className="flex flex-col items-center gap-2 p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all group">
          <PlusSquare className="h-8 w-8 text-emerald-600 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium text-slate-700">Registrar</span>
        </Link>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Betterware Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-blue-700" />
            <h3 className="text-xl font-semibold text-blue-900">Enhorabuena Betterware</h3>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-blue-100 bg-blue-50/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-blue-900">Disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-950">{bwAvailable}</div>
                <p className="text-xs text-blue-600 mt-1">{bwReserved} apartados</p>
              </CardContent>
            </Card>

            <Card className="border-blue-100 bg-blue-50/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-blue-900">Valor Inventario</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-950">
                  ${bwInventoryValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100 bg-blue-50/30 sm:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-blue-900">Ventas (Este Mes)</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent className="flex justify-between items-end">
                <div>
                  <div className="text-2xl font-bold text-blue-950">
                    ${bwRevenueThisMonth.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-blue-600 mt-1">{bwSoldThisMonth} unidades vendidas</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tienda Personal Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Store className="h-6 w-6 text-emerald-700" />
            <h3 className="text-xl font-semibold text-emerald-900">Tienda Personal</h3>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-emerald-100 bg-emerald-50/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-emerald-900">Disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-950">{tpAvailable}</div>
                <p className="text-xs text-emerald-600 mt-1">{tpReserved} apartados</p>
              </CardContent>
            </Card>

            <Card className="border-emerald-100 bg-emerald-50/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-emerald-900">Valor Inventario</CardTitle>
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-950">
                  ${tpInventoryValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-100 bg-emerald-50/30 sm:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-emerald-900">Ventas (Este Mes)</CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent className="flex justify-between items-end">
                <div>
                  <div className="text-2xl font-bold text-emerald-950">
                    ${tpRevenueThisMonth.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-emerald-600 mt-1">{tpSoldThisMonth} unidades vendidas</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
