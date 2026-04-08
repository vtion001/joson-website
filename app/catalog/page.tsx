"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Download, ArrowRight, CookingPot, BedDouble, Sofa, DoorOpen, Shirt } from "lucide-react"

const categories = [
  {
    icon: CookingPot,
    title: "Kitchen Cabinets",
    description: "Custom designed and manufactured kitchen cabinetry for modern Filipino homes.",
    href: "/products/kitchen-cabinets",
  },
  {
    icon: BedDouble,
    title: "Wardrobes",
    description: "Space-saving wardrobes built with quality engineered wood and premium hardware.",
    href: "/products/wardrobes",
  },
  {
    icon: DoorOpen,
    title: "Walk-in Closets",
    description: "Bespoke walk-in closet solutions tailored to your storage needs and style.",
    href: "/products/walk-in-closets",
  },
  {
    icon: Sofa,
    title: "Bespoke Furniture",
    description: "Custom furniture pieces designed and crafted to your specifications.",
    href: "/products/bespoke-furniture",
  },
  {
    icon: Shirt,
    title: "Bathroom Vanities",
    description: "Durable and stylish bathroom vanities that combine function and aesthetics.",
    href: "/products/bathroom-vanities",
  },
]

export default function CatalogPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section aria-labelledby="catalog-title" role="region" className="relative py-24 bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-muted/30 blur-2xl" />
        </div>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-6">
              <BookOpen className="w-8 h-8 text-accent" />
            </div>
            <h1 id="catalog-title" className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              Product Catalog
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty">
              Browse our complete range of quality furniture products. Download our catalog or explore our product categories below.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button size="lg" className="transition-transform duration-200 ease-out hover:-translate-y-[1px]">
                <Download className="w-4 h-4 mr-2" />
                Download PDF Catalog
              </Button>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="transition-transform duration-200 ease-out hover:-translate-y-[1px]">
                  Request Physical Copy
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section aria-labelledby="categories-title" role="region" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 id="categories-title" className="text-4xl font-bold text-foreground mb-6 text-balance">
              Product Categories
            </h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
              Explore our range of custom furniture solutions, from kitchen cabinets to bespoke pieces.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {categories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link href={category.href}>
                  <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-border/60 bg-card/50 backdrop-blur-sm relative overflow-hidden h-full">
                    <CardContent className="p-8 text-center relative z-10 h-full flex flex-col">
                      <motion.div
                        className="w-16 h-16 mx-auto mb-6 bg-accent/10 rounded-full flex items-center justify-center group-hover:bg-accent/20 transition-all duration-300"
                        whileHover={{ scale: 1.1 }}
                      >
                        <category.icon className="w-8 h-8 text-accent" />
                      </motion.div>
                      <h3 className="text-xl font-semibold text-primary mb-4">{category.title}</h3>
                      <p className="text-muted-foreground leading-relaxed flex-grow mb-6">{category.description}</p>
                      <div className="inline-flex items-center gap-2 text-accent font-medium">
                        View Products <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Full Product Line CTA */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-foreground mb-6 text-balance">
                Looking for something specific?
              </h2>
              <p className="text-lg text-muted-foreground mb-6 text-pretty">
                We offer custom fabrication services for unique furniture requirements. Whether you need a special size, finish, or completely bespoke design — our team in Bulacan can bring your vision to life.
              </p>
              <ul className="space-y-3 text-muted-foreground mb-8">
                <li className="flex items-center gap-3">
                  <span className="size-2 rounded-full bg-accent" />
                  Custom dimensions and configurations
                </li>
                <li className="flex items-center gap-3">
                  <span className="size-2 rounded-full bg-accent" />
                  Wide range of materials and finishes
                </li>
                <li className="flex items-center gap-3">
                  <span className="size-2 rounded-full bg-accent" />
                  CNC precision cutting and edge banding
                </li>
                <li className="flex items-center gap-3">
                  <span className="size-2 rounded-full bg-accent" />
                  Professional installation services
                </li>
              </ul>
              <Link href="/contact">
                <Button size="lg">
                  Get a Custom Quote
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <img
                src="/IMG20230512120029.jpg"
                alt="Joson Furniture workshop craftsmanship"
                loading="lazy"
                decoding="async"
                className="w-full h-96 object-cover rounded-2xl shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/10 to-transparent rounded-2xl" />
              <div className="absolute bottom-4 left-4 inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs text-foreground">
                Batia, Bocaue, Bulacan
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-foreground mb-4">Ready to start your project?</h3>
          <p className="text-muted-foreground mb-8">Contact us for quotes, consultations, or to schedule a showroom visit.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/contact">
              <Button size="lg">Contact Us</Button>
            </Link>
            <Link href="/products">
              <Button size="lg" variant="outline">View All Products</Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
