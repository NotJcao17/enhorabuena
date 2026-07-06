import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { locationSchema } from "@/lib/validations"
import { z } from "zod"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const locations = await prisma.location.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { units: true }
        }
      }
    })
    return NextResponse.json(locations)
  } catch (error) {
    return NextResponse.json({ error: "Error fetching locations" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const json = await req.json()
    const { name } = locationSchema.parse(json)

    const lastLocation = await prisma.location.findFirst({
      orderBy: { sortOrder: 'desc' }
    })
    const nextSortOrder = (lastLocation?.sortOrder ?? 0) + 1

    const location = await prisma.location.create({
      data: { name, sortOrder: nextSortOrder }
    })
    return NextResponse.json(location)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation Error", details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Error creating location" }, { status: 500 })
  }
}
