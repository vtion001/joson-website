"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Hammer, Paintbrush, Bed, Check, ArrowRight, Truck, Shield, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ServicesPage() {
  const services = [
    {
      id: "modular-cabinets",
      icon: Hammer,
      title: "Modular Cabinet Services",
      description: "Custom-built modular cabinets designed to maximize your space. Perfect for kitchens, wardrobes, bathrooms, and walk-in closets. Our expert craftsmen deliver precision and quality in every piece.",
      features: [
        "Free on-site measurement and consultation",
        "3D design visualization before production",
        "Premium hardware and soft-close mechanisms",
        "Professional installation by experienced craftsmen",
        "1-year warranty on all cabinet work",
      ],
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop",
    },
    {
      id: "powder-coating",
      icon: Paintbrush,
      title: "Powder Coating Services",
      description: "Professional powder coating for metal furniture and fixtures. Provides a durable, corrosion-resistant finish that lasts longer than traditional paint. Perfect for bed frames, metal fixtures, and outdoor furniture.",
      features: [
        "Wide range of color options including black, gold, and custom metallic finishes",
        "Durable scratch-resistant coating",
        "Eco-friendly and lead-free process",
        "Quick turnaround time",
        "Ideal for bed frames, metal fixtures, and outdoor furniture",
      ],
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
    },
    {
      id: "bed-frame-manufacturing",
      icon: Bed,
      title: "Bed Frame Manufacturing",
      description: "Crafted in our Bulacan workshop, our bed frames combine traditional Filipino craftsmanship with modern design. From affordable AFFORDABED to premium collections — built to last generations.",
      features: [
        "Solid hardwood and metal frame options",
        "Custom sizes: Single, Double, Queen, King",
        "Bunk beds, loft beds, platform beds, and canopy beds",
        "Built to last generations",
        "Proudly made in Batia, Bocaue, Bulacan",
      ],
      image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop",
    },
  ]

  const highlights = [
    { icon: Truck, title: "Metro Manila & Bulacan Delivery", description: "We deliver and install across key locations" },
    { icon: Shield, title: "1-Year Warranty", description: "Quality guaranteed on all products" },
    { icon: Clock, title: "7-14 Days Lead Time", description: "Efficient production without compromising quality" },
  ]

  return (
    <main className="min-h-screen bg-background">
      <section aria-labelledby="services-title" role="region" className="relative py-24 bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden">
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
            <h1 id="services-title" className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              Our Services
            </h1>
            <p className="text-xl text-muted-foreground text-pretty mb-8">
              From custom modular cabinets to powder coating and bed frame manufacturing — we bring your vision to life with quality Filipino craftsmanship.
            </p>
            <div className="mx-auto h-px w-24 bg-gradient-to-r from-primary to-accent opacity-80" />
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {highlights.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center gap-4 p-6 bg-card border border-border/50 rounded-xl"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="space-y-24">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                id={service.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-xl mb-6">
                    <service.icon className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
                    {service.title}
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6 text-pretty">
                    {service.description}
                  </p>
                  <ul className="space-y-3 mb-8">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/contact">
                    <Button className="group">
                      Get a Quote
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
                <div className={`relative ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl opacity-50" />
                  <img
                    src={service.image}
                    alt={service.title}
                    loading="lazy"
                    decoding="async"
                    className="relative w-full h-80 object-cover rounded-2xl shadow-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-2xl" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold text-foreground mb-6 text-balance">
              Ready to start your project?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 text-pretty">
              Contact us today for a free consultation. Our team is ready to help you bring your ideas to life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="transition-transform duration-200 ease-out hover:-translate-y-[1px]">
                  Get Free Consultation
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
