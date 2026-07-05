import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Sidebar } from "@/components/admin/Sidebar"
import { Header } from "@/components/admin/Header"
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
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Toaster position="top-right" />
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header lastSync={lastSyncLog?.finishedAt || null} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
