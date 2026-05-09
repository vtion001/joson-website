"use client"
import * as React from "react"
import Link from "next/link"
import { SidePanelNavigationEnhanced, type NavSection } from "@/components/side-panel-navigation-enhanced"

export function AdminSidePanel(): JSX.Element {
  const navigation: NavSection[] = [
    {
      title: "OVERVIEW",
      items: [{ title: "Dashboard", href: "/admin", iconName: "dashboard" }],
    },
    {
      title: "CONTENT",
      items: [
        { title: "Projects", href: "/admin/projects", iconName: "folder" },
      ],
    },
    {
      title: "COMMUNICATION",
      items: [
        { title: "Email", href: "/admin/email", iconName: "mail" },
      ],
    },
    {
      title: "OPERATIONS",
      items: [
        { title: "CRM", href: "/admin/crm", iconName: "users" },
        { title: "Project Management", href: "/admin/project-management", iconName: "chart" },
      ],
    },
    {
      title: "TOOLS",
      items: [
        { title: "Calculator Pricing", href: "/admin/calculator-pricing", iconName: "calculator" },
        { title: "Fabricators", href: "/admin/fabricators", iconName: "wrench" },
      ],
    },
  ]

  const utility = [
    { title: "Settings", href: "/admin/settings", iconName: "settings" },
    { title: "Help", href: "/admin/help", iconName: "help" },
  ]

  return (
    <SidePanelNavigationEnhanced
      brandName="Joson Furniture Admin"
      brandInitial="A"
      breadcrumbItems={["Dashboard", "Admin"]}
      navigation={navigation}
      utility={utility}
    />
  )
}
