import Link from "next/link"

export function RecentInquiries({ inquiries }: { inquiries: { id: string; name: string; email: string; phone: string; message: string; attachments?: any[]; date: string }[] }): JSX.Element {
  const items = Array.isArray(inquiries) ? inquiries.slice(0, 5) : []
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border/50 text-sm font-semibold text-foreground">Recent Inquiries</div>
      {items.length === 0 ? (
        <div className="px-5 py-6 text-sm text-muted-foreground text-center">No inquiries yet</div>
      ) : (
        <ul className="divide-y divide-border/50">
          {items.map((q) => (
            <li key={q.id} className="px-5 py-4 flex items-start gap-4 hover:bg-muted/30 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <div className="font-medium truncate capitalize">{q.name}</div>
                  <div className="text-xs text-muted-foreground shrink-0">{new Date(q.date).toLocaleDateString()}</div>
                </div>
                <div className="text-xs text-muted-foreground mb-2">{q.email}</div>
                <div className="text-sm text-foreground line-clamp-2 capitalize">{q.message}</div>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap shrink-0 pt-0.5">{Array.isArray(q.attachments) && q.attachments.length > 0 ? `${q.attachments.length} file(s)` : null}</div>
            </li>
          ))}
        </ul>
      )}
      <div className="px-5 py-3 border-t border-border/50 text-right">
        <Link href="/admin/inquiries" className="text-primary text-sm hover:underline">View all</Link>
      </div>
    </div>
  )
}
