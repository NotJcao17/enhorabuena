import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { AdminShell } from "@/components/admin/AdminShell"
import prisma from "@/lib/prisma"
import { Toaster } from "react-hot-toast"

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session) {
    redirect("/admin/login")
  }

  // Get last sync time
  const lastSyncLog = await prisma.syncLog.findFirst({
    orderBy: { startedAt: 'desc' },
    where: { status: 'success' }
  })

  return (
    <>
      <Toaster position="top-right" />
      <AdminShell lastSync={lastSyncLog?.finishedAt || null}>
        {children}
      </AdminShell>
    </>
  )
}
