import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await context.params
    const id = parseInt(paramId)
    const { action, salePrice, notes } = await req.json()
    
    if (action === "edit") {
      const sale = await prisma.customSaleRecord.update({
        where: { id },
        data: { salePrice: Number(salePrice), notes }
      })
      return NextResponse.json(sale)
    } 
    
    if (action === "revert") {
      const sale = await prisma.customSaleRecord.findUnique({ where: { id } })
      if (!sale || sale.reversed) return NextResponse.json({ error: "Cannot revert" }, { status: 400 })
      
      // Restore stock
      await prisma.customProduct.update({
        where: { id: sale.customProductId },
        data: {
          stock: { increment: sale.quantity },
          soldCount: { decrement: sale.quantity }
        }
      })
      
      // Mark reversed
      const updated = await prisma.customSaleRecord.update({
        where: { id },
        data: { reversed: true, reversedAt: new Date() }
      })
      
      return NextResponse.json(updated)
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: "Error updating custom sale" }, { status: 500 })
  }
}
