import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { customProductId, quantity, salePrice, action } = await req.json()
    // action: 'sell_available', 'sell_reserved'
    
    const product = await prisma.customProduct.findUnique({ where: { id: customProductId } })
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 })

    const finalPrice = salePrice || product.price

    // Create the sale record
    const sale = await prisma.customSaleRecord.create({
      data: {
        customProductId,
        quantity,
        salePrice: finalPrice,
        soldAt: new Date()
      }
    })

    // Update product stock and soldCount
    if (action === 'sell_available') {
      await prisma.customProduct.update({
        where: { id: customProductId },
        data: {
          stock: { decrement: quantity },
          soldCount: { increment: quantity }
        }
      })
    } else if (action === 'sell_reserved') {
      await prisma.customProduct.update({
        where: { id: customProductId },
        data: {
          reservedCount: { decrement: quantity },
          soldCount: { increment: quantity }
        }
      })
    }

    return NextResponse.json(sale)
  } catch (error) {
    return NextResponse.json({ error: "Error creating sale" }, { status: 500 })
  }
}
