import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// Root admin layout — only for /admin/login and /admin/logout
// All other /admin/* routes are inside (dashboard)/ which has auth
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // No auth check here — (dashboard)/layout.tsx handles that for protected routes
  return <>{children}</>
}
