"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

type ProductSpec = {
  material?: string
  finish?: string
  hardware?: string
  thickness?: string
  installation?: string
  warranty?: string
}

type Product = {
  id: string
  name: string
  category?: string
  image?: string
  description?: string
  features?: string[]
  specs?: ProductSpec
  gallery?: string[]
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

  return (
    <main className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b border-border/50">
        <div className="container mx-auto px-4 py-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
            <span>/</span>
            <span className="text-foreground font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div>
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-muted mb-4 relative">
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
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      i === activeImage ? "border-primary" : "border-transparent hover:border-border"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {product.category && (
              <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground mb-4">
                {product.category}
              </span>
            )}
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">{product.name}</h1>

            {product.description && (
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {product.description}
              </p>
            )}

            {product.features && product.features.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">Features</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.specs && Object.values(product.specs).some(Boolean) && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">Specifications</h2>
                <div className="grid grid-cols-2 gap-3">
                  {product.specs.material && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Material</div>
                      <div className="text-sm font-medium text-foreground">{product.specs.material}</div>
                    </div>
                  )}
                  {product.specs.finish && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Finish</div>
                      <div className="text-sm font-medium text-foreground">{product.specs.finish}</div>
                    </div>
                  )}
                  {product.specs.hardware && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Hardware</div>
                      <div className="text-sm font-medium text-foreground">{product.specs.hardware}</div>
                    </div>
                  )}
                  {product.specs.thickness && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Thickness</div>
                      <div className="text-sm font-medium text-foreground">{product.specs.thickness}</div>
                    </div>
                  )}
                  {product.specs.installation && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Installation</div>
                      <div className="text-sm font-medium text-foreground">{product.specs.installation}</div>
                    </div>
                  )}
                  {product.specs.warranty && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Warranty</div>
                      <div className="text-sm font-medium text-foreground">{product.specs.warranty}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="flex-1">
                <Link href="/contact">Get a Free Quote</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="flex-1">
                <Link href="/calculator">Estimate Cost</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-foreground mb-6">Ready to transform your space?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Contact Joson Furniture today for a free consultation and quote.
            </p>
            <Button size="lg" asChild>
              <Link href="/contact">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
