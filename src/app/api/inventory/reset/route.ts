import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      
    // Cambiar 'available' -> 'withdrawn'
    const result = await prisma.inventoryUnit.updateMany({
      where: { status: 'available' },
      data: { 
        status: 'withdrawn',
        statusChangedAt: new Date()
      }
    })
    
    return NextResponse.json({ success: true, count: result.count })
  } catch {
    return NextResponse.json({ error: "Error resetting inventory" }, { status: 500 })
  }
}
