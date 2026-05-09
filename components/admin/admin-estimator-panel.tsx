"use client"

import * as React from "react"
import { useState } from "react"
import { EstimatorCalculator } from "@/components/admin/estimator-calculator"
import { Calculator, ChevronDown, ChevronUp } from "lucide-react"

export function AdminEstimatorPanel(): JSX.Element {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <section id="admin-estimator-panel" className="mb-6 relative z-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 font-semibold">
          <Calculator className="w-4 h-4 text-primary" />
          Cost Estimator
        </div>
        <button
          type="button"
          aria-label={collapsed ? "Expand calculator" : "Collapse calculator"}
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {collapsed ? (
            <>
              <ChevronDown className="w-4 h-4" /> Show
            </>
          ) : (
            <>
              <ChevronUp className="w-4 h-4" /> Hide
            </>
          )}
        </button>
      </div>
      {!collapsed && <EstimatorCalculator />}
    </section>
  )
}
