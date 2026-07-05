import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('name')

    if (!category) {
      return NextResponse.json({ error: "Nombre de categoría requerido" }, { status: 400 })
    }

    // Set category to null for all custom products that have this category
    await prisma.customProduct.updateMany({
      where: { category },
      data: { category: null }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Error deleting category" }, { status: 500 })
  }
}
