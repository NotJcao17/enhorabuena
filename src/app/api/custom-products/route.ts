import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const products = await prisma.customProduct.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: "Error fetching products" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    // ensure numeric
    if (data.price) data.price = Number(data.price)
    if (data.stock !== undefined) data.stock = Number(data.stock)
    if (data.category) {
      data.category = data.category.charAt(0).toUpperCase() + data.category.slice(1).toLowerCase()
    }
    
    const product = await prisma.customProduct.create({ data })
    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: "Error creating product" }, { status: 500 })
  }
}
