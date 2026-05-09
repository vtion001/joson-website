import { cookies } from "next/headers"
import { verifySession } from "@/lib/auth"
import { ToastOnParam } from "@/components/admin/toast-on-param"
import { redirect } from "next/navigation"
import { AdminEstimatorPanel } from "@/components/admin/admin-estimator-panel"
import { AdminSidePanel } from "@/components/admin/admin-side-panel"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sessionCookie = cookies().get("admin_session")?.value
  const verified = sessionCookie ? verifySession(sessionCookie) : null

  // Skip auth check when SKIP_AUTH=1 (dev mode), but still render full admin layout
  if (process.env.SKIP_AUTH === "1") {
    return (
      <div className="min-h-screen bg-background">
        <AdminSidePanel />
        <main className="max-w-6xl mx-auto px-4 py-8 pt-16 md:pl-64">
          <ToastOnParam param="logged" value="1" message="Signed in successfully" />
          <AdminEstimatorPanel />
          {children}
        </main>
      </div>
    )
  }

  if (!verified) {
    redirect("/admin/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidePanel />
      <main className="max-w-6xl mx-auto px-4 py-8 pt-16 md:pl-64">
        <ToastOnParam param="logged" value="1" message="Signed in successfully" />
        <AdminEstimatorPanel />
        {children}
      </main>
    </div>
  )
}
