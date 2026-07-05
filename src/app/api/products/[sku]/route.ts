import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req: Request, context: { params: Promise<{ sku: string }> }) {
  try {
    const { sku } = await context.params
    const product = await prisma.catalogProduct.findUnique({
      where: { sku }
    })
    
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
    
    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: "Error fetching product" }, { status: 500 })
  }
}
