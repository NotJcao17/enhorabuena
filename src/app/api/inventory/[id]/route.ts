import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { id: paramId } = await context.params
    const id = parseInt(paramId)
    const data = await req.json()

    // Fetch current unit to check status
    const existingUnit = await prisma.inventoryUnit.findUnique({ where: { id } })
    if (!existingUnit) {
      return NextResponse.json({ error: "Unidad no encontrada" }, { status: 404 })
    }

    // Block modifying location/price on sold units (not when reverting via status change)
    if (existingUnit.status === 'sold' && !data.status && (data.locationId !== undefined || data.customPrice !== undefined)) {
      return NextResponse.json({ error: "No se puede modificar una unidad vendida" }, { status: 400 })
    }
    
    // Validate sale
    if (data.status === 'sold') {
      data.soldAt = new Date()
    } else if (data.status && data.status !== 'sold') {
      data.soldAt = null
      data.salePrice = null
      data.saleReversed = false
      data.saleReversedAt = null
    }

    if (data.status) {
      data.statusChangedAt = new Date()
    }

    // Convert customPrice back to null if it's empty string
    if (data.customPrice === "") data.customPrice = null;
    if (data.salePrice === "") data.salePrice = null;

    // Si se envía customPrice, actualizar a TODAS las unidades del mismo producto
    if (data.customPrice !== undefined) {
      await prisma.inventoryUnit.updateMany({
        where: { catalogProductId: existingUnit.catalogProductId },
        data: { customPrice: data.customPrice }
      });
      // Removemos customPrice para que el update individual no lo sobreescriba (ya se actualizó arriba)
      delete data.customPrice;
    }

    const unit = await prisma.inventoryUnit.update({
      where: { id },
      data
    })
    
    return NextResponse.json(unit)
  } catch (error) {
    return NextResponse.json({ error: "Error updating unit" }, { status: 500 })
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { id: paramId } = await context.params
    const id = parseInt(paramId)

    await prisma.inventoryUnit.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Error deleting unit" }, { status: 500 })
  }
}
