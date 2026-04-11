"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, Image as ImageIcon, Clock, Shield, Truck, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

type ProductSpec = {
  material?: string
  finish?: string
  hardware?: string
  thickness?: string
  sizes?: string
  installation?: string
  warranty?: string
}

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
  specs?: ProductSpec
  gallery?: string[]
}

const categoryColors: Record<string, string> = {
  AFFORDABED: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  Premium: "bg-black/60 text-yellow-400 border border-yellow-500/30",
  Ordinary: "bg-black/40 text-white border border-white/20",
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: { items?: Product[]; item?: Product }) => {
        const list = data.items || []
        const found = list.find((p) => p.id === params.id)
        setProduct(found || null)
        setLoaded(true)
      })
      .catch(() => {
        setError(true)
        setLoaded(true)
      })
  }, [params.id])

  if (loaded && !product) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">The product you are looking for does not exist.</p>
          <Button asChild>
            <Link href="/products">Browse All Products</Link>
          </Button>
        </div>
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Something went wrong</h1>
          <p className="text-muted-foreground mb-8">Unable to load product details.</p>
          <Button asChild>
            <Link href="/products">Browse All Products</Link>
          </Button>
        </div>
      </main>
    )
  }

  const allImages = [product.image, ...(product.gallery || [])].filter(Boolean) as string[]
  const colorClass = product.category ? categoryColors[product.category] : "bg-muted text-muted-foreground"

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-border/50">
        <div className="container mx-auto px-4 py-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          <div className="space-y-4">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-muted mb-4 relative shadow-lg">
              {allImages[activeImage] ? (
                <img
                  src={allImages[activeImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
              {product.ready && (
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/70 px-4 py-1.5 text-sm font-medium text-yellow-400 border border-yellow-500/30 shadow-lg">
                    <Check className="w-4 h-4" />
                    Available Now
                  </span>
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      i === activeImage ? "border-primary shadow-md" : "border-transparent hover:border-border"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                {product.category && (
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${colorClass}`}>
                    {product.category}
                  </span>
                )}
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{product.leadTime || "7-14 days"} lead time</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
                {product.name}
              </h1>
              {product.priceRange && (
                <p className="text-2xl font-semibold text-primary mb-4">
                  {product.priceRange}
                </p>
              )}
            </div>

            {product.description && (
              <p className="text-base text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                <Truck className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-xs text-muted-foreground">Delivery</div>
                  <div className="text-sm font-medium">Metro Manila & Bulacan</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-xs text-muted-foreground">Warranty</div>
                  <div className="text-sm font-medium">{product.specs?.warranty || "1 year"}</div>
                </div>
              </div>
            </div>

            {product.features && product.features.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">Key Features</h2>
                <ul className="grid grid-cols-1 gap-2">
                  {product.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button size="lg" asChild className="flex-1 shadow-lg shadow-primary/25">
                <Link href="/contact">Get a Free Quote</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="flex-1">
                <Link href="/calculator">Estimate Cost</Link>
              </Button>
            </div>
          </div>
        </div>

        {product.specs && Object.values(product.specs).some(Boolean) && (
          <div className="mt-16 pt-12 border-t border-border">
            <h2 className="text-2xl font-bold text-foreground mb-8">Specifications</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {product.specs.material && (
                <div className="p-5 rounded-xl bg-card border border-border">
                  <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Material</div>
                  <div className="text-base font-semibold text-foreground">{product.specs.material}</div>
                </div>
              )}
              {product.specs.finish && (
                <div className="p-5 rounded-xl bg-card border border-border">
                  <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Finish</div>
                  <div className="text-base font-semibold text-foreground">{product.specs.finish}</div>
                </div>
              )}
              {product.specs.hardware && (
                <div className="p-5 rounded-xl bg-card border border-border">
                  <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Hardware</div>
                  <div className="text-base font-semibold text-foreground">{product.specs.hardware}</div>
                </div>
              )}
              {product.specs.thickness && (
                <div className="p-5 rounded-xl bg-card border border-border">
                  <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Thickness</div>
                  <div className="text-base font-semibold text-foreground">{product.specs.thickness}</div>
                </div>
              )}
              {product.specs.sizes && (
                <div className="p-5 rounded-xl bg-card border border-border">
                  <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Available Sizes</div>
                  <div className="text-base font-semibold text-foreground">{product.specs.sizes}</div>
                </div>
              )}
              {product.specs.installation && (
                <div className="p-5 rounded-xl bg-card border border-border">
                  <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Installation</div>
                  <div className="text-base font-semibold text-foreground">{product.specs.installation}</div>
                </div>
              )}
              {product.specs.warranty && (
                <div className="p-5 rounded-xl bg-card border border-border">
                  <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Warranty</div>
                  <div className="text-base font-semibold text-foreground">{product.specs.warranty}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <section className="py-20 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Have questions about this product?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Our furniture specialists are ready to help you choose the perfect piece for your space.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/contact">Get a Free Consultation</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/products">Browse More Products</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}