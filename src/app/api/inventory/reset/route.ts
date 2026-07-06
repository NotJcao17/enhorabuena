import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      
    // Eliminar 'available'
    const result = await prisma.inventoryUnit.deleteMany({
      where: { status: 'available' }
    })
    
    return NextResponse.json({ success: true, count: result.count })
  } catch {
    return NextResponse.json({ error: "Error resetting inventory" }, { status: 500 })
  }
}
