import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    // BW Sales
    const bwSales = await prisma.inventoryUnit.findMany({
      where: { status: 'sold' },
      include: {
        catalogProduct: true,
        location: true
      },
      orderBy: { soldAt: 'desc' }
    })

    // Custom Sales
    const customSales = await prisma.customSaleRecord.findMany({
      include: {
        customProduct: true
      },
      orderBy: { soldAt: 'desc' }
    })

    // Unify
    const unified = [
      ...bwSales.map(s => ({
        id: s.id,
        type: 'bw',
        productName: s.catalogProduct.title,
        sku: s.catalogProduct.sku,
        category: s.catalogProduct.productType,
        salePrice: Number(s.salePrice ?? s.customPrice ?? s.catalogProduct.priceBetterware),
        soldAt: s.soldAt,
        locationName: s.location?.name,
        isReversed: s.saleReversed,
        quantity: 1,
        notes: s.notes
      })),
      ...customSales.map(s => ({
        id: s.id,
        type: 'custom',
        productName: s.customProduct.name,
        sku: null,
        category: s.customProduct.category || 'Sin categoría',
        salePrice: s.salePrice,
        soldAt: s.soldAt,
        locationName: null,
        isReversed: s.reversed,
        quantity: s.quantity,
        notes: s.notes
      }))
    ].sort((a, b) => new Date(b.soldAt || 0).getTime() - new Date(a.soldAt || 0).getTime())

    return NextResponse.json(unified)
  } catch (error) {
    return NextResponse.json({ error: "Error fetching sales" }, { status: 500 })
  }
}
