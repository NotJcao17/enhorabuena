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
    
    if (data.price !== undefined) data.price = Number(data.price)
    if (data.stock !== undefined) data.stock = Number(data.stock)
    if (data.category) {
      data.category = data.category.charAt(0).toUpperCase() + data.category.slice(1).toLowerCase()
    }
    
    const product = await prisma.customProduct.update({
      where: { id },
      data
    })
    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: "Error updating product" }, { status: 500 })
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { id: paramId } = await context.params
    const id = parseInt(paramId)
    await prisma.customProduct.update({
      where: { id },
      data: { isActive: false } // Soft delete
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Error deleting product" }, { status: 500 })
  }
}
