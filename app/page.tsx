"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import productsData from "@/data/products.json"
import { projects } from "@/lib/projects-data"

type ProductItem = { id: string; name: string; category: string; image?: string }

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section aria-labelledby="hero-title" role="banner" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <video autoPlay muted loop playsInline preload="metadata" poster="/placeholder.svg" className="absolute inset-0 w-full h-full object-cover opacity-30">
          <source
            src="https://res.cloudinary.com/dbviya1rj/video/upload/v1757002878/v4veuczqvimciwmg2lfc.mp4"
            type="video/mp4"
          />
        </video>

        <div className="absolute inset-0 hero-gradient opacity-70"></div>

        <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
          <div className="text-sm font-medium text-primary mb-4 tracking-wider uppercase">FILIPINO CRAFT, WORLD-CLASS COMFORT</div>

          <h1 id="hero-title" className="text-5xl md:text-7xl font-bold text-foreground mb-6 text-balance animate-in">
            Joson Furniture
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto text-pretty slide-in-from-bottom-2">
            Where Filipino artistry meets timeless design. Quality furniture for every home.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button aria-label="Get in touch" size="lg" className="px-8 py-6 text-lg transition-transform duration-200 ease-out hover:-translate-y-[1px]">
                Get In Touch
                <span className="ml-2">→</span>
              </Button>
            </Link>
            <Link href="/catalog">
              <Button aria-label="Get catalog" variant="outline" size="lg" className="px-8 py-6 text-lg bg-transparent transition-transform duration-200 ease-out hover:-translate-y-[1px]">
                Get Catalog
                <span className="ml-2">↓</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Section 01 - Mission & Vision */}
      <section
        aria-labelledby="mission-title"
        role="region"
        className="relative py-32 overflow-hidden bg-black"
      >
        {/* Noise grain texture overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" aria-hidden="true">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <filter id="noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noise)" />
          </svg>
        </div>

        {/* Decorative geometric accents */}
        <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none" aria-hidden="true">
          <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-[0.06]">
            <circle cx="200" cy="200" r="180" stroke="white" strokeWidth="1" />
            <circle cx="200" cy="200" r="140" stroke="white" strokeWidth="1" />
            <circle cx="200" cy="200" r="100" stroke="white" strokeWidth="1" />
            <line x1="0" y1="200" x2="400" y2="200" stroke="white" strokeWidth="0.5" />
            <line x1="200" y1="0" x2="200" y2="400" stroke="white" strokeWidth="0.5" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-64 h-64 pointer-events-none" aria-hidden="true">
          <svg viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-[0.05]">
            <polygon points="128,0 256,256 0,256" stroke="white" strokeWidth="1" fill="none" />
            <polygon points="128,40 216,216 40,216" stroke="white" strokeWidth="0.5" fill="none" />
          </svg>
        </div>

                <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-5 gap-0 min-h-[600px]">

            {/* Left — Mission (55%) */}
            <div className="lg:col-span-3 relative flex flex-col justify-between pr-0 lg:pr-20 border-r border-white/10">
              {/* Section label */}
              <div className="mb-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center gap-2"
                >
                  <span className="w-8 h-px bg-white" />
                  <span className="text-xs font-semibold tracking-[0.3em] uppercase text-white/60">Our Mission</span>
                </motion.div>
              </div>

              {/* Mission statement — large serif */}
              <motion.h2
                id="mission-title"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.15 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-8"
              >
                <span className="text-white/90">To build furniture that </span>
                <span className="text-white">Filipino families</span>
                <span className="text-white/90"> can afford, trust, and be proud of.</span>
              </motion.h2>

              {/* Mission sub-text */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="text-lg text-white/40 leading-relaxed max-w-xl"
              >
                Every joint, every finish, every detail — crafted with the same care whether it is a ₱5,000 bed frame or a ₱50,000 set. Real wood. Real craft. Honest pricing.
              </motion.p>

              {/* Decorative line */}
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="mt-12 h-px bg-gradient-to-r from-white/20 via-white/10 to-transparent origin-left"
              />

              {/* Bottom stat row */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mt-10 grid grid-cols-3 gap-6"
              >
                {[
                  { value: "100%", label: "Real Wood", sub: "No particle board" },
                  { value: "₱0", label: "Hidden Fees", sub: "What you see" },
                  { value: "10yr", label: "Warranty", sub: "On craftsmanship" },
                ].map((stat, i) => (
                  <div key={i} className="border-l border-white/15 pl-4">
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm font-medium text-white/70 mt-0.5">{stat.label}</div>
                    <div className="text-xs text-white/30 mt-0.5">{stat.sub}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — Vision (45%) */}
            <div className="lg:col-span-2 relative flex flex-col justify-center pl-0 lg:pl-16 mt-12 lg:mt-0">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 mb-6"
              >
                <span className="w-8 h-px bg-white" />
                <span className="text-xs font-semibold tracking-[0.3em] uppercase text-white/60">Our Vision</span>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="text-xl md:text-2xl text-white/60 leading-snug mb-10 font-light"
              >
                To become the most trusted furniture maker in the Philippines — one home, one community at a time.
              </motion.p>

              {/* Vision pillars */}
              <div className="space-y-4">
                {[
                  {
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    ),
                    title: "Every Home Deserves Quality",
                    desc: "From studio apartments in Makati to family homes in Davao — comfort should never be a luxury.",
                  },
                  {
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    ),
                    title: "Built to Last Generations",
                    desc: "We design for durability, not disposal. Each piece outlasts trends and survives daily life.",
                  },
                  {
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    ),
                    title: "Filipino Craft, Global Standard",
                    desc: "Bulacan craftsmanship recognized worldwide — proof that本地手艺 can compete internationally.",
                  },
                ].map((pillar, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6, delay: 0.2 + i * 0.12 }}
                    className="group relative rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/8 hover:-translate-y-0.5"
                  >
                    {/* Accent glow */}
                    <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full bg-white/0 group-hover:bg-white/5 transition-colors duration-500 blur-xl" />
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-0.5 w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white group-hover:bg-white/10 transition-colors">
                        {pillar.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-white/90 text-sm group-hover:text-white/80 transition-colors">{pillar.title}</div>
                        <div className="text-xs text-white/35 mt-1 leading-relaxed">{pillar.desc}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: 0.65 }}
                className="mt-8 flex items-center gap-4"
              >
                <Link href="/about">
                  <Button
                    size="lg"
                    className="bg-white hover:bg-white/90 text-white border-0 transition-transform duration-200 ease-out hover:-translate-y-[1px] hover:shadow-lg hover:shadow-white/10"
                  >
                    Our Story
                    <span className="ml-2">→</span>
                  </Button>
                </Link>
                <Link href="/products">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="text-white/50 hover:text-white/80 transition-colors"
                  >
                    View Collection
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 02 - About Us */}
      <section
        aria-labelledby="about-title"
        role="region"
        className="relative py-24 overflow-hidden bg-black"
      >
        {/* Noise grain texture overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" aria-hidden="true">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <filter id="noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noise)" />
          </svg>
        </div>

        {/* Decorative geometric accents */}
        <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none" aria-hidden="true">
          <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-[0.06]">
            <circle cx="200" cy="200" r="180" stroke="white" strokeWidth="1" />
            <circle cx="200" cy="200" r="140" stroke="white" strokeWidth="1" />
            <circle cx="200" cy="200" r="100" stroke="white" strokeWidth="1" />
            <line x1="0" y1="200" x2="400" y2="200" stroke="white" strokeWidth="0.5" />
            <line x1="200" y1="0" x2="200" y2="400" stroke="white" strokeWidth="0.5" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-64 h-64 pointer-events-none" aria-hidden="true">
          <svg viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-[0.05]">
            <polygon points="128,0 256,256 0,256" stroke="white" strokeWidth="1" fill="none" />
            <polygon points="128,40 216,216 40,216" stroke="white" strokeWidth="0.5" fill="none" />
          </svg>
        </div>
                <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — Text content */}
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center rounded-full bg-white/20 text-white px-3 py-1 text-xs font-medium">
                    Est. Bulacan
                  </span>
                  <span className="inline-flex items-center gap-2 text-white/40 text-sm">
                    <span className="size-2 rounded-full bg-white animate-pulse" />
                    Crafting since 2010
                  </span>
                </div>
                <h2 id="about-title" className="text-4xl md:text-5xl font-bold text-white/90 mb-4 leading-tight">
                  Filipino Hands,<br />World-Class Comfort
                </h2>
                <p className="text-lg text-white/40 leading-relaxed">
                  Joson Furniture started with a simple belief: every Filipino deserves a bed frame that feels solid, looks good, and does not cost a fortune. Proudly from Bulacan, we have grown from a local workshop to a trusted name across the Philippines — honoring Filipino craftsmanship that continues to inspire the world.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: "300+", label: "Happy Customers", icon: "★", color: "text-white" },
                  { value: "100%", label: "Filipino Crafted", icon: "✦", color: "text-white" },
                  { value: "10+", label: "Years Experience", icon: "◆", color: "text-white" },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className={`text-2xl mb-1 ${stat.color}`}>{stat.icon}</div>
                    <div className="text-2xl font-bold text-white/90">{stat.value}</div>
                    <div className="text-xs text-white/40 mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Highlights */}
              <div className="flex flex-wrap gap-3" aria-label="Highlights">
                {[
                  { text: "Affordable Quality", color: "bg-white/8 text-white/80", dot: "bg-white" },
                  { text: "Built in Bulacan", color: "bg-white/8 text-white/80", dot: "bg-white" },
                  { text: "Space-Saving Designs", color: "bg-white/8 text-white/80", dot: "bg-white" },
                  { text: "Nationwide Delivery", color: "bg-white/8 text-white/80", dot: "bg-white" },
                ].map((item, i) => (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium ${item.color}`}
                  >
                    <span className={`size-2 rounded-full ${item.dot}`} />
                    {item.text}
                  </span>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <Link href="/about">
                  <Button size="lg" className="transition-transform duration-200 ease-out hover:-translate-y-[1px]">
                    Know More
                    <span className="ml-2">→</span>
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="lg" className="transition-transform duration-200 ease-out hover:-translate-y-[1px]">
                    Get a Free Quote
                    <span className="ml-2">→</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right — Photo */}
            <div className="relative group rounded-3xl overflow-hidden">
              <img
                src="/IMG20230512120029.jpg"
                alt="Joson Furniture craftsman at work in our Bulacan workshop"
                loading="lazy"
                decoding="async"
                className="w-full h-[560px] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center rounded-full bg-white/20 text-white px-3 py-1 text-xs font-medium">
                    Bulacan Made
                  </span>
                  <span className="inline-flex items-center rounded-full bg-white/10 text-white/80 px-3 py-1 text-xs">
                    Filipino Pride
                  </span>
                </div>
                <Link href="/about" aria-label="Learn more about us">
                  <Button variant="outline" size="sm" className="backdrop-blur-sm bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50">
                    Learn More
                    <span className="ml-1">→</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 03 - Our Bed Frames */}
      <section aria-labelledby="bedframes-title" role="region" className="relative py-24 overflow-hidden bg-black">
        {/* Noise grain texture overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" aria-hidden="true">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <filter id="noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noise)" />
          </svg>
        </div>

        {/* Decorative geometric accents */}
        <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none" aria-hidden="true">
          <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-[0.06]">
            <circle cx="200" cy="200" r="180" stroke="white" strokeWidth="1" />
            <circle cx="200" cy="200" r="140" stroke="white" strokeWidth="1" />
            <circle cx="200" cy="200" r="100" stroke="white" strokeWidth="1" />
            <line x1="0" y1="200" x2="400" y2="200" stroke="white" strokeWidth="0.5" />
            <line x1="200" y1="0" x2="200" y2="400" stroke="white" strokeWidth="0.5" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-64 h-64 pointer-events-none" aria-hidden="true">
          <svg viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-[0.05]">
            <polygon points="128,0 256,256 0,256" stroke="white" strokeWidth="1" fill="none" />
            <polygon points="128,40 216,216 40,216" stroke="white" strokeWidth="0.5" fill="none" />
          </svg>
        </div>
                <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 id="bedframes-title" className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Our Bed Frames</h2>
            <p className="text-lg text-white/50 max-w-3xl mx-auto">Handcrafted in Bulacan, delivered nationwide. Filipino-made quality at prices that respect your budget.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {(productsData as ProductItem[]).slice(0, 6).map((product) => (
              <Link key={product.id} href="/products" aria-label={product.name} className="group">
                <article className="cursor-pointer">
                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-64 object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-white/20 text-white px-3 py-1 text-xs font-medium">
                          {product.category}
                        </span>
                      </div>
                      <span className="inline-flex items-center rounded-md bg-white/80 text-[#0f0c09] px-2 py-1 text-xs">
                        View<span className="ml-1">→</span>
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                    <p className="text-white/40 text-sm">Handcrafted bed frame</p>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link href="/products">
              <Button size="lg" className="transition-transform duration-200 ease-out hover:-translate-y-[1px] bg-white hover:bg-white/90 text-white">
                View All Products
                <span className="ml-2">→</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Section 04 - Why Choose Joson */}
      <section aria-labelledby="advantages-title" role="region" className="relative py-24 overflow-hidden bg-black">
        {/* Noise grain texture overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" aria-hidden="true">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <filter id="noise-section4">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noise-section4)" />
          </svg>
        </div>

        {/* Decorative geometric accents */}
        <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none" aria-hidden="true">
          <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-[0.06]">
            <circle cx="200" cy="200" r="180" stroke="white" strokeWidth="1" />
            <circle cx="200" cy="200" r="140" stroke="white" strokeWidth="1" />
            <circle cx="200" cy="200" r="100" stroke="white" strokeWidth="1" />
            <line x1="0" y1="200" x2="400" y2="200" stroke="white" strokeWidth="0.5" />
            <line x1="200" y1="0" x2="200" y2="400" stroke="white" strokeWidth="0.5" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-64 h-64 pointer-events-none" aria-hidden="true">
          <svg viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-[0.05]">
            <polygon points="128,0 256,256 0,256" stroke="white" strokeWidth="1" fill="none" />
            <polygon points="128,40 216,216 40,216" stroke="white" strokeWidth="0.5" fill="none" />
          </svg>
        </div>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-white/15 blur-2xl" />
        </div>
                <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — Heading + Advantage list */}
            <div>
              <div className="text-sm font-medium text-white mb-3 tracking-widest uppercase">Our Promise</div>
              <h2 id="advantages-title" className="text-4xl md:text-5xl font-bold text-white/90 mb-4 leading-tight">
                Why Families<br />Trust Joson
              </h2>
              <p className="text-lg text-white/40 leading-relaxed mb-10">
                We believe a great bed frame shouldn't break the bank. Every piece is built to last, designed smart, and made right here in Bulacan.
              </p>

              <div className="space-y-6">
                {[
                  {
                    icon: "badge-peso",
                    title: "Honest Pricing, No Hidden Costs",
                    desc: "Quality furniture at prices that respect your budget. What you see is what you pay.",
                  },
                  {
                    icon: "shield-check",
                    title: "Built to Last Decades",
                    desc: "Real wood frames and reinforced joints — not hollow, flimsy alternatives.",
                  },
                  {
                    icon: "ruler",
                    title: "Space-Smart Designs",
                    desc: "Bunk beds, loft beds, and platform frames that maximize every square meter.",
                  },
                  {
                    icon: "hand-heart",
                    title: "Filipino Craftsmanship",
                    desc: "Skilled local artisans take pride in every joint, every finish, every detail.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-5 group-hover:translate-x-1 transition-transform duration-300">
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors duration-300">
                      {item.icon === "badge-peso" && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                      )}
                      {item.icon === "shield-check" && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
                          <path d="m9 12 2 2 4-4"/>
                        </svg>
                      )}
                      {item.icon === "ruler" && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0z"/>
                          <path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/>
                        </svg>
                      )}
                      {item.icon === "hand-heart" && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <path d="M11 14H9a3 3 0 0 0-3 3v2c0 1.57.5 2.5 2 2.5s2-.93 2-2.5v-2a1 1 0 0 0-1-1H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-1V9"/>
                          <path d="M18 9a4 4 0 0 0-4-4h-2"/>
                          <path d="M9 9a4 4 0 0 0-4 4v1"/>
                          <path d="M15 9a4 4 0 0 0-4-4"/>
                          <path d="M11.5 9.5 10 12l-1.5-2.5"/>
                        </svg>
                      )}
                    </div>
                    <div className="pt-1">
                      <h3 className="font-semibold text-white/90 mb-1 group-hover:text-white transition-colors">{item.title}</h3>
                      <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Workshop image + stat overlay */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden">
                <img
                  src="https://res.cloudinary.com/dbviya1rj/image/upload/v1775691664/b4dprppedgffyckfwtcq.png"
                  alt="Joson Furniture craftsman hand-finishing a bed frame in our Bulacan workshop"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-[560px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </div>

              {/* Floating stat cards */}
              <div className="absolute -bottom-6 left-6 right-6 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 text-center shadow-lg">
                  <div className="text-2xl font-bold text-white">300+</div>
                  <div className="text-xs text-white/40 mt-0.5">Happy Customers</div>
                </div>
                <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 text-center shadow-lg">
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-xs text-white/40 mt-0.5">Filipino Made</div>
                </div>
                <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 text-center shadow-lg">
                  <div className="text-2xl font-bold text-white">10+</div>
                  <div className="text-xs text-white/40 mt-0.5">Years Experience</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 05 - Product Lines */}
      <section aria-labelledby="lines-title" role="region" className="relative py-24 bg-black overflow-hidden">
        {/* Noise grain texture overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" aria-hidden="true">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <filter id="noise5">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noise5)" />
          </svg>
        </div>

        {/* Decorative geometric accents */}
        <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none" aria-hidden="true">
          <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-[0.06]">
            <circle cx="200" cy="200" r="180" stroke="white" strokeWidth="1" />
            <circle cx="200" cy="200" r="140" stroke="white" strokeWidth="0.5" />
            <line x1="0" y1="200" x2="400" y2="200" stroke="white" strokeWidth="0.5" />
            <line x1="200" y1="0" x2="200" y2="400" stroke="white" strokeWidth="0.5" />
            <path d="M 60 200 A 140 140 0 0 1 340 200" stroke="white" strokeWidth="0.5" fill="none" />
            <path d="M 100 200 A 100 100 0 0 1 300 200" stroke="white" strokeWidth="0.5" fill="none" />
          </svg>
        </div>
                <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 id="lines-title" className="text-4xl md:text-5xl font-bold text-white/90 mb-6 tracking-tight">Our Product Lines</h2>
            <p className="text-lg text-white/40 max-w-3xl mx-auto">From budget-friendly to premium, we have a bed frame for every need.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                name: "AFFORDABED", 
                description: "Simple, solid, and affordable sleep setups. Perfect for condos, apartments, and first-time furniture buyers.",
                href: "/products"
              },
              { 
                name: "Ordinary Collection", 
                description: "Quality everyday furniture at accessible prices. Built for real Filipino homes and everyday use.",
                href: "/products"
              },
              { 
                name: "Premium Collection", 
                description: "Higher-end designs for those seeking luxury aesthetics. Crafted with premium materials and attention to detail.",
                href: "/products"
              },
            ].map((line) => (
              <div key={line.name} className="group text-center w-full">
                <div className="relative bg-white/5 border border-white/10 rounded-xl p-8 transition-all duration-200 hover:shadow-md hover:-translate-y-[2px]">
                  <h3 className="text-2xl font-bold text-white/90 mb-4">{line.name}</h3>
                  <p className="text-white/50 mb-6">{line.description}</p>
                  <Link href={line.href}>
                    <Button variant="outline" size="sm" className="group-hover:border-white/20 group-hover:text-white border-white/15 text-white/70">
                      View Products
                      <span className="ml-1">→</span>
                    </Button>
                  </Link>
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-white/5 to-transparent" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Section 06 - Testimonials */}
      <section aria-labelledby="testimonials-title" role="region" className="relative py-32 overflow-hidden bg-black">
        {/* Noise grain texture overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" aria-hidden="true">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <filter id="noise2">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noise2)" />
          </svg>
        </div>

        {/* Decorative geometric accents */}
        <div className="absolute top-0 left-0 w-96 h-96 pointer-events-none" aria-hidden="true">
          <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-[0.06]">
            <circle cx="200" cy="200" r="180" stroke="white" strokeWidth="1" />
            <circle cx="200" cy="200" r="140" stroke="white" strokeWidth="1" />
            <circle cx="200" cy="200" r="100" stroke="white" strokeWidth="1" />
            <circle cx="200" cy="200" r="60" stroke="white" strokeWidth="0.5" />
            <line x1="0" y1="200" x2="400" y2="200" stroke="white" strokeWidth="0.5" />
            <line x1="200" y1="0" x2="200" y2="400" stroke="white" strokeWidth="0.5" />
            <line x1="0" y1="0" x2="400" y2="400" stroke="white" strokeWidth="0.3" />
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 w-80 h-80 pointer-events-none" aria-hidden="true">
          <svg viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-[0.05]">
            <polygon points="160,0 320,320 0,320" stroke="white" strokeWidth="1" fill="none" />
            <polygon points="160,60 260,260 60,260" stroke="white" strokeWidth="0.5" fill="none" />
            <polygon points="160,100 220,220 100,220" stroke="white" strokeWidth="0.3" fill="none" />
          </svg>
        </div>

        {/* Large decorative quote mark */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-none" aria-hidden="true">
          <svg width="120" height="90" viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-[0.08]">
            <path d="M0 90V54C0 24.18 22.65 4.8 54 0L57.6 10.8C40.5 14.4 30.6 24.3 29.7 39H48V90H0ZM72 90V54C72 24.18 94.65 4.8 126 0L129.6 10.8C112.5 14.4 102.6 24.3 101.7 39H120V90H72Z" fill="white" />
          </svg>
        </div>

        <div className="container mx-auto px-4 max-w-7xl">
          {/* Section header */}
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 mb-4"
            >
              <span className="w-8 h-px bg-white/20" />
              <span className="text-xs font-semibold tracking-[0.3em] uppercase text-white/60">Testimonials</span>
              <span className="w-8 h-px bg-white/20" />
            </motion.div>
            <motion.h2
              id="testimonials-title"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold tracking-tight text-white/90"
            >
              What Our Customers Say
            </motion.h2>
          </div>

          {/* Magazine-style asymmetric testimonial layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

            {/* Left testimonial — small card */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="lg:col-span-4"
            >
              <div className="group relative h-full rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all duration-500 hover:border-white/20 hover:bg-white/8 hover:-translate-y-1">
                {/* Gold accent line */}
                <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent transition-all duration-500 group-hover:via-white/30" />

                {/* Quote mark */}
                <svg aria-hidden="true" className="h-5 w-5 text-white/40 mb-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.17 6A5.17 5.17 0 0 0 2 11.17V22h8v-8H6.83A3.83 3.83 0 0 1 10.66 10c0-2.21-1.79-4-3.49-4zm10 0A5.17 5.17 0 0 0 12 11.17V22h8v-8h-3.17A3.83 3.83 0 0 1 20.66 10c0-2.21-1.79-4-3.49-4z"/>
                </svg>

                <p className="text-white/60 leading-relaxed mb-6 text-sm">
                  "Buti na lang may ganito, quality na, abot-kaya pa. My AFFORDABED bunk bed is super sturdy and perfect for my kids' room."
                </p>

                {/* Stars */}
                <div className="flex items-center gap-0.5 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>

                {/* Attribution */}
                <div className="border-t border-white/10 pt-4">
                  <div className="font-semibold text-white/90 text-sm">Maria Santos</div>
                  <div className="text-xs text-white/50 uppercase tracking-wider mt-0.5">Homeowner</div>
                </div>

                {/* Corner accent */}
                <div className="absolute -bottom-1 -right-1 w-12 h-12 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
                  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="48" cy="48" r="48" stroke="white" strokeWidth="0.5" />
                  </svg>
                </div>
              </div>
            </motion.div>

            {/* Center — Featured large testimonial */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="lg:col-span-4 flex"
            >
              <div className="group relative h-full w-full rounded-2xl border border-white/15 bg-white/8 p-10 backdrop-blur-sm transition-all duration-500 hover:border-white/20 hover:bg-white/10 hover:-translate-y-1">
                {/* Gold accent line */}
                <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent transition-all duration-500 group-hover:via-white/40" />

                {/* Large quote mark */}
                <svg aria-hidden="true" className="h-8 w-8 text-white/50 mb-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.17 6A5.17 5.17 0 0 0 2 11.17V22h8v-8H6.83A3.83 3.83 0 0 1 10.66 10c0-2.21-1.79-4-3.49-4zm10 0A5.17 5.17 0 0 0 12 11.17V22h8v-8h-3.17A3.83 3.83 0 0 1 20.66 10c0-2.21-1.79-4-3.49-4z"/>
                </svg>

                <p className="text-white/75 leading-relaxed mb-8 text-base">
                  "Perfect for our rental property. Durable, affordable, and tenants love them! The premium platform bed looks amazing."
                </p>

                {/* Stars */}
                <div className="flex items-center gap-0.5 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>

                {/* Attribution */}
                <div className="border-t border-white/15 pt-5">
                  <div className="font-bold text-white/95 text-lg">Juan Cruz</div>
                  <div className="text-sm text-white/60 uppercase tracking-wider mt-0.5">Property Owner</div>
                </div>

                {/* Decorative bottom accent */}
                <div className="absolute bottom-4 right-4 pointer-events-none opacity-20 group-hover:opacity-50 transition-opacity">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="20,0 40,40 0,40" stroke="white" strokeWidth="0.5" fill="none" />
                  </svg>
                </div>
              </div>
            </motion.div>

            {/* Right testimonial — small card */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="lg:col-span-4"
            >
              <div className="group relative h-full rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all duration-500 hover:border-white/20 hover:bg-white/8 hover:-translate-y-1">
                {/* Gold accent line */}
                <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent transition-all duration-500 group-hover:via-white/30" />

                {/* Quote mark */}
                <svg aria-hidden="true" className="h-5 w-5 text-white/40 mb-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.17 6A5.17 5.17 0 0 0 2 11.17V22h8v-8H6.83A3.83 3.83 0 0 1 10.66 10c0-2.21-1.79-4-3.49-4zm10 0A5.17 5.17 0 0 0 12 11.17V22h8v-8h-3.17A3.83 3.83 0 0 1 20.66 10c0-2.21-1.79-4-3.49-4z"/>
                </svg>

                <p className="text-white/60 leading-relaxed mb-6 text-sm">
                  "Joson Furniture delivers on their promise of Filipino craft. The attention to detail in their premium line is impressive."
                </p>

                {/* Stars */}
                <div className="flex items-center gap-0.5 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>

                {/* Attribution */}
                <div className="border-t border-white/10 pt-4">
                  <div className="font-semibold text-white/90 text-sm">Ana Reyes</div>
                  <div className="text-xs text-white/50 uppercase tracking-wider mt-0.5">Interior Designer</div>
                </div>

                {/* Corner accent */}
                <div className="absolute -bottom-1 -left-1 w-12 h-12 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
                  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="0" cy="48" r="48" stroke="white" strokeWidth="0.5" />
                  </svg>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom decorative bar */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent origin-left"
          />
        </div>
      </section>
    </div>
  )
}
