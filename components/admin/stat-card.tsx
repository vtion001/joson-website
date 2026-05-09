"use client"
import * as React from "react"
import Link from "next/link"

export function StatCard({ title, value, icon, href, subtext }: { title: string; value: string | number; icon: React.ReactNode; href?: string; subtext?: string }): JSX.Element {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-primary/10 to-accent/5">
      <div className="absolute -right-4 -top-4 opacity-[0.07] text-accent scale-90">{icon}</div>
      <div className="p-5">
        <div className="text-sm text-muted-foreground mb-2">{title}</div>
        <div className="text-3xl font-bold mb-2">{value}</div>
        {subtext && <div className="text-xs text-muted-foreground mb-3">{subtext}</div>}
        {href && (
          <Link href={href} aria-label={`Manage ${title}`} className="inline-flex items-center gap-2 text-primary text-sm">
            Manage
          </Link>
        )}
      </div>
    </div>
  )
}
