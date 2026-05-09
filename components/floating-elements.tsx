"use client"
import { usePathname } from "next/navigation"
import { FloatingContact } from "@/components/floating-contact"
import { LiveChat } from "@/components/live-chat"

export function FloatingElements() {
  const pathname = usePathname()
  if (pathname?.startsWith("/admin")) return null
  return (
    <>
      <FloatingContact />
      <LiveChat />
    </>
  )
}
