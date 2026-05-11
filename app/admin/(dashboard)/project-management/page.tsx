import { FolderKanban } from "lucide-react"

export default function ProjectManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FolderKanban className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Project Management</h1>
      </div>

      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <FolderKanban className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h2 className="text-lg font-semibold mb-2">Coming Soon</h2>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          Project tracking, task assignments, timelines, and team collaboration features are currently in development.
        </p>
      </div>
    </div>
  )
}
