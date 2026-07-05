import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LoginForm } from "./LoginForm"

export default async function LoginPage() {
  const session = await auth()
  if (session) {
    redirect("/admin")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <LoginForm />
    </div>
  )
}
