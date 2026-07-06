import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const configs = await prisma.appConfig.findMany()
    const configMap = configs.reduce((acc: any, curr) => {
      acc[curr.key] = curr.value
      return acc
    }, {})
    return NextResponse.json(configMap)
  } catch {
    return NextResponse.json({ error: "Error fetching config" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const data = await req.json()
    // data is { whatsapp_maru: "...", whatsapp_mosco: "...", store_name: "..." }
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        await prisma.appConfig.upsert({
          where: { key },
          update: { value },
          create: { key, value }
        })
      }
    }
    
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error updating config" }, { status: 500 })
  }
}
