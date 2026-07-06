import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const units = await prisma.inventoryUnit.findMany({
      include: {
        catalogProduct: true,
        location: true
      },
      orderBy: { registeredAt: 'desc' }
    })
    return NextResponse.json(units)
  } catch (error) {
    return NextResponse.json({ error: "Error fetching inventory" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { sku, locationId, quantity = 1 } = await req.json()
    
    const product = await prisma.catalogProduct.findUnique({ where: { sku } })
    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado en el catálogo" }, { status: 404 })
    }

    const existingCustomPriceUnit = await prisma.inventoryUnit.findFirst({
      where: { catalogProductId: product.id, customPrice: { not: null } },
      select: { customPrice: true }
    })
    
    const inheritedCustomPrice = existingCustomPriceUnit?.customPrice || null

    const units = Array.from({ length: Number(quantity) }).map(() => ({
      catalogProductId: product.id,
      locationId: locationId || null,
      status: 'available' as const,
      registeredAt: new Date(),
      statusChangedAt: new Date(),
      customPrice: inheritedCustomPrice
    }))

    await prisma.inventoryUnit.createMany({ data: units })
    return NextResponse.json({ success: true, count: quantity })
  } catch (error) {
    return NextResponse.json({ error: "Error creating inventory units" }, { status: 500 })
  }
}
