"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Image as ImageIcon, Clock, Check } from "lucide-react"

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

const categoryColors: Record<string, string> = {
  AFFORDABED: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  Premium: "bg-black/60 text-yellow-400 border border-yellow-500/30",
  Ordinary: "bg-black/40 text-white border border-white/20",
}

export default function ProductCard({ product }: { product: Product }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  const colorClass = product.category ? categoryColors[product.category] : "bg-muted text-muted-foreground"

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="group"
    >
      <Link href={`/products/${product.id}`}>
        <div className="bg-card border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/5">
          <div className="aspect-[4/3] relative overflow-hidden">
            {!loaded && !error && (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
            {!error ? (
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                loading="lazy"
                decoding="async"
                onLoad={() => setLoaded(true)}
                onError={() => setError(true)}
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <ImageIcon className="w-10 h-10 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            <div className="absolute top-4 left-4 flex items-center gap-2">
              {product.category && (
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${colorClass}`}>
                  {product.category}
                </span>
              )}
            </div>

            {product.ready && (
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-yellow-400 border border-yellow-500/30">
                  <Check className="w-3 h-3" />
                  Ready
                </span>
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-xl font-bold text-white mb-1 leading-tight">
                {product.name}
              </h3>
              {product.priceRange && (
                <p className="text-sm text-white/80 font-medium">
                  {product.priceRange}
                </p>
              )}
            </div>
          </div>

          <div className="p-5">
            {product.description && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            )}

            {product.specs?.material && (
              <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Material: <span className="text-foreground font-medium">{product.specs.material}</span></span>
              </div>
            )}

            {product.features && product.features.length > 0 && (
              <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>{product.features.length} features included</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>{product.leadTime || "7-14 days"}</span>
              </div>
              <Button variant="ghost" className="group/btn p-0 h-auto font-medium text-sm">
                View Details
                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}