"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useState } from "react"
import Link from "next/link"
import { X } from "lucide-react"

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const galleryItems = [
    {
      src: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop",
      alt: "Premium Bed Frame Collection",
      category: "Bed Frames",
    },
    {
      src: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
      alt: "Custom Modular Kitchen",
      category: "Modular Cabinets",
    },
    {
      src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
      alt: "Powder Coated Metal Fixtures",
      category: "Powder Coating",
    },
    {
      src: "https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=800&h=600&fit=crop",
      alt: "AFFORDABED Collection",
      category: "Bed Frames",
    },
    {
      src: "https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=800&h=600&fit=crop",
      alt: "Modern Bunk Bed Design",
      category: "Bed Frames",
    },
    {
      src: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop",
      alt: "Custom Wardrobe Installation",
      category: "Modular Cabinets",
    },
    {
      src: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop",
      alt: "Loft Bed Solution",
      category: "Bed Frames",
    },
    {
      src: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&h=600&fit=crop",
      alt: "Complete Bedroom Set",
      category: "Bed Frames",
    },
    {
      src: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
      alt: "Kitchen Cabinet Detail",
      category: "Modular Cabinets",
    },
  ]

  return (
    <main className="min-h-screen bg-background">
      <section className="relative py-24 bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden">
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
            <h1 id="gallery-title" className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              Our Gallery
            </h1>
            <p className="text-xl text-muted-foreground text-pretty mb-8">
              Browse our collection of completed projects. From bed frames to modular cabinets — see quality Filipino craftsmanship in action.
            </p>
            <div className="mx-auto h-px w-24 bg-gradient-to-r from-primary to-accent opacity-80" />
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
          >
            {galleryItems.map((image, index) => (
              <motion.div
                key={index}
                className="group relative overflow-hidden rounded-xl aspect-[4/3] cursor-pointer"
                variants={{ hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1 } }}
                transition={{ duration: 0.8, delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedImage(image.src)}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="inline-block bg-primary/90 text-black text-xs font-medium px-3 py-1 rounded-full mb-2">
                    {image.category}
                  </span>
                  <h3 className="text-white font-semibold">{image.alt}</h3>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
            onClick={() => setSelectedImage(null)}
            aria-label="Close lightbox"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={selectedImage}
            alt="Gallery image enlarged"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <section className="py-20 bg-card">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold text-foreground mb-6 text-balance">
              Want to see more of our work?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 text-pretty">
              Follow us on social media for daily updates on our latest projects and designs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="transition-transform duration-200 ease-out hover:-translate-y-[1px]">
                  Get a Free Quote
                  <span className="ml-2">→</span>
                </Button>
              </Link>
              <Link href="/products">
                <Button size="lg" variant="outline" className="transition-transform duration-200 ease-out hover:-translate-y-[1px]">
                  View Products
                  <span className="ml-2">→</span>
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
