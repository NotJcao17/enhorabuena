import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { saleEditSchema } from "@/lib/validations"
import { z } from "zod"

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { id: paramId } = await context.params
    const id = parseInt(paramId)
    const json = await req.json()
    const { action, salePrice, notes } = saleEditSchema.parse(json)
    
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
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation Error", details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Error updating custom sale" }, { status: 500 })
  }
}
