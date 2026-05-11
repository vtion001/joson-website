import { cookies } from "next/headers"
import { verifySession } from "@/lib/auth"
import { ToastOnParam } from "@/components/admin/toast-on-param"
import { redirect } from "next/navigation"
import { AdminEstimatorPanel } from "@/components/admin/admin-estimator-panel"
import { AdminSidePanel } from "@/components/admin/admin-side-panel"

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const sessionCookie = cookies().get("admin_session")?.value
  const verified = sessionCookie ? verifySession(sessionCookie) : null

  if (process.env.SKIP_AUTH !== "1" && !verified) {
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
