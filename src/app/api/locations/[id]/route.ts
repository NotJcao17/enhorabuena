import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { locationSchema } from "@/lib/validations"
import { z } from "zod"

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { id: paramId } = await context.params
    const id = parseInt(paramId)
    const json = await req.json()
    const { name } = locationSchema.parse(json)

    const location = await prisma.location.update({
      where: { id },
      data: { name }
    })
    return NextResponse.json(location)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation Error", details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Error updating location" }, { status: 500 })
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { id: paramId } = await context.params
    const id = parseInt(paramId)
    
    // Check if there are units
    const unitsCount = await prisma.inventoryUnit.count({
      where: { locationId: id }
    })
    
    if (unitsCount > 0) {
      // Body will specify reassign logic
      const { reassignToId } = await req.json()
      
      await prisma.inventoryUnit.updateMany({
        where: { locationId: id },
        data: { locationId: reassignToId || null }
      })
    }

    await prisma.location.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Error deleting location" }, { status: 500 })
  }
}
