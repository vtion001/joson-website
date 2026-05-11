import { HelpCircle } from "lucide-react"

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <HelpCircle className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Help & Support</h1>
      </div>

      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h2 className="text-lg font-semibold mb-2">Coming Soon</h2>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          Documentation, guides, and support resources for the Joson Furniture admin panel are currently being developed.
        </p>
      </div>
    </div>
  )
}
