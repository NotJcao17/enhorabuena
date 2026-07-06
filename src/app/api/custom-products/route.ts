import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { customProductSchema } from "@/lib/validations"
import { z } from "zod"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const json = await req.json()
    const data = customProductSchema.parse(json)
    
    if (data.category) {
      data.category = data.category.charAt(0).toUpperCase() + data.category.slice(1).toLowerCase()
    }
    
    const product = await prisma.customProduct.create({ data })
    return NextResponse.json(product)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation Error", details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Error creating product" }, { status: 500 })
  }
}
