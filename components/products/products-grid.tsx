"use client"
import { useMemo, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import ProductCard from "./product-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type Product = {
  id: string
  name: string
  category?: string
  image?: string
  description?: string
  priceRange?: string
  leadTime?: string
  ready?: boolean
  features?: string[]
  specs?: Record<string, string>
}

export default function ProductsGrid({ products }: { products: Product[] }) {
  const searchParams = useSearchParams()
  const categories = useMemo(() => {
    const set = new Set<string>()
    products.forEach((p) => p.category && set.add(p.category))
    return Array.from(set)
  }, [products])

  const [query, setQuery] = useState("")
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const category = searchParams.get("category")
    if (category) {
      setActive(decodeURIComponent(category))
    }
  }, [searchParams])

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesQuery = query.trim().length === 0 || p.name.toLowerCase().includes(query.toLowerCase())
      const matchesCategory = !active || p.category === active
      return matchesQuery && matchesCategory
    })
  }, [products, query, active])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant={!active ? "default" : "outline"}
            size="sm"
            onClick={() => setActive(null)}
            className="rounded-full"
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={active === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setActive(active === cat ? null : cat)}
              className="rounded-full"
            >
              {cat}
            </Button>
          ))}
        </div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products"
          className="md:w-80"
        />
      </div>

      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {filtered.map((p) => (
          <motion.div key={p.id} variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}>
            <ProductCard product={p} />
          </motion.div>
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center text-muted-foreground py-12">No products match your filters</div>
      )}
    </div>
  )
}