import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await context.params
    const id = parseInt(paramId)
    const { action, salePrice, notes } = await req.json()
    
    if (action === "edit") {
      const sale = await prisma.inventoryUnit.update({
        where: { id },
        data: { salePrice: Number(salePrice), notes }
      })
      return NextResponse.json(sale)
    } 
    
    if (action === "revert") {
      const sale = await prisma.inventoryUnit.findUnique({ where: { id } })
      if (!sale || sale.saleReversed) return NextResponse.json({ error: "Cannot revert" }, { status: 400 })
      
      // Revert status to available and mark saleReversed
      const updated = await prisma.inventoryUnit.update({
        where: { id },
        data: { 
          status: 'available', 
          saleReversed: true, 
          saleReversedAt: new Date(),
          statusChangedAt: new Date()
        }
      })
      
      return NextResponse.json(updated)
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: "Error updating bw sale" }, { status: 500 })
  }
}
