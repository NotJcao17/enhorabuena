import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
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
  try {
    const { name } = await req.json()
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 })

    const lastLocation = await prisma.location.findFirst({
      orderBy: { sortOrder: 'desc' }
    })
    const nextSortOrder = (lastLocation?.sortOrder ?? 0) + 1

    const location = await prisma.location.create({
      data: { name, sortOrder: nextSortOrder }
    })
    return NextResponse.json(location)
  } catch (error) {
    return NextResponse.json({ error: "Error creating location" }, { status: 500 })
  }
}
