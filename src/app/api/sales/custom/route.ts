import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { saleCustomSchema } from "@/lib/validations"
import { z } from "zod"

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const json = await req.json()
    const { customProductId, quantity, salePrice, action } = saleCustomSchema.parse(json)
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
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation Error", details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Error creating sale" }, { status: 500 })
  }
}
