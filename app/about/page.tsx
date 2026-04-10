"use client"

import { motion } from "framer-motion"
import { Award, Users, Globe, Calendar } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export default function AboutPage() {
  const stats = [
    { value: 10, suffix: "+", label: "Years of Combined Experience", icon: <Calendar className="w-6 h-6" /> },
    { value: 300, suffix: "+", label: "Projects Completed", icon: <Award className="w-6 h-6" /> },
    { value: 10, suffix: "+", label: "Skilled Craftsmen", icon: <Users className="w-6 h-6" /> },
    { value: 3, suffix: "", label: "Locations Served", icon: <Globe className="w-6 h-6" /> },
  ]

  function Counter({ to, duration = 1.2 }: { to: number; duration?: number }) {
    const [value, setValue] = useState(0)
    useEffect(() => {
      let raf: number
      const start = performance.now()
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / (duration * 1000))
        setValue(Math.floor(t * to))
        if (t < 1) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
      return () => cancelAnimationFrame(raf)
    }, [to, duration])
    return <>{value}</>
  }

  return (
    <main className="min-h-screen bg-background">
      <section aria-labelledby="about-title" role="region" className="relative py-24 bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-muted/30 blur-2xl" />
        </div>
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center max-w-4xl mx-auto">
            <h1 id="about-title" className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">About Joson Furniture</h1>
            <p className="text-xl text-muted-foreground text-pretty mb-8">Filipino Craft, World-Class Comfort</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="#story"><Button size="lg" className="transition-transform duration-200 ease-out hover:-translate-y-[1px]">Our Story<span className="ml-2">→</span></Button></Link>
              <Link href="/products"><Button variant="outline" size="lg" className="transition-transform duration-200 ease-out hover:-translate-y-[1px]">View Products<span className="ml-2">→</span></Button></Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="story" className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <h2 className="text-4xl font-bold text-foreground mb-6 text-balance">Our Story</h2>
              <p className="text-lg text-muted-foreground mb-6 text-pretty">
                Joson Furniture started with a simple belief: every Filipino deserves a bed frame that feels solid, looks good, and does not cost a fortune. We are proudly from <strong>Batia, Bocaue, Bulacan</strong>, a place known for craftsmanship and hard work.
              </p>
              <p className="text-lg text-muted-foreground mb-6 text-pretty">
                What began as a local mission to serve families in our community grew into something bigger. We kept hearing the same thing from customers: <em>"Buti na lang may ganito, quality na, abot-kaya pa."</em> That has been our fuel ever since.
              </p>
              <p className="text-lg text-muted-foreground text-pretty">
                Today, we are proud to serve Filipino families across the Philippines with quality bed frames that combine tradition and innovation — bringing world-class comfort into every home.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm"><span className="size-2 rounded-full bg-primary mr-2" />Filipino Craft</span>
                <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm"><span className="size-2 rounded-full bg-emerald-500 mr-2" />Bulacan Made</span>
                <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm"><span className="size-2 rounded-full bg-blue-500 mr-2" />Affordable Quality</span>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative">
              <img src="https://res.cloudinary.com/dbviya1rj/image/upload/v1775691664/b4dprppedgffyckfwtcq.png" alt="Joson Furniture workshop in Bulacan" loading="lazy" decoding="async" className="w-full h-96 object-cover rounded-2xl shadow-lg" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/10 to-transparent rounded-2xl" />
              <div className="absolute bottom-4 left-4 inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs text-foreground">Bulacan, Philippines</div>
            </motion.div>
          </div>
        </div>
      </section>

      <section aria-labelledby="mission-title" role="region" className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h3 id="mission-title" className="text-3xl font-bold text-foreground mb-6">Our Mission</h3>
              <p className="text-lg text-muted-foreground text-pretty">
                To provide Filipino families with quality bed frames at affordable prices. We build comfort, reliability, and peace of mind into every piece we make.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center"
            >
              <h3 className="text-3xl font-bold text-foreground mb-6">Our Vision</h3>
              <p className="text-lg text-muted-foreground text-pretty">
                To bring Bulacan-made bed frames into homes across the Philippines and eventually worldwide — while maintaining our promise: quality sleep setups affordable for everyone.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section aria-labelledby="achievements-title" role="region" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 id="achievements-title" className="text-4xl font-bold text-foreground mb-6 text-balance">Our Achievements</h2>
            <p className="text-xl text-muted-foreground text-pretty">
              Numbers that reflect our commitment to excellence
            </p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 text-accent rounded-full mb-4">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold text-foreground mb-2"><Counter to={stat.value} />{stat.suffix}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="values-title" role="region" className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 id="values-title" className="text-4xl font-bold text-foreground mb-6 text-balance">Our Core Values</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Filipino Pride",
                description: "Celebrating Bulacan's craftsmanship heritage in every piece we make.",
              },
              {
                title: "Affordability",
                description: "Quality furniture without the excessive price tag, accessible to every Filipino family.",
              },
              {
                title: "Durability",
                description: "Built to last, built for everyday use. Our frames are sturdy and long-lasting.",
              },
              {
                title: "Practicality",
                description: "Designs made for real Philippine homes — space-saving solutions for smaller rooms.",
              },
              {
                title: "Trust",
                description: "Reliable products, reliable service. We deliver on our promises.",
              },
              {
                title: "Customer First",
                description: "Your home setup matters to us. We listen, improve, and deliver.",
              },
            ].map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-md transition-all"
              >
                <h3 className="text-xl font-semibold text-foreground mb-3">{value.title}</h3>
                <p className="text-muted-foreground text-pretty">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA — merged "Get a Quote" + "View Projects" */}
      <section aria-labelledby="cta-title" role="region" className="relative py-32 overflow-hidden bg-black">
        {/* Noise grain overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden="true">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <filter id="noise-cta">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noise-cta)" />
          </svg>
        </div>

        {/* Geometric decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none" aria-hidden="true">
          <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-[0.05]">
            <circle cx="200" cy="200" r="180" stroke="white" strokeWidth="1" />
            <circle cx="200" cy="200" r="140" stroke="white" strokeWidth="0.5" />
            <circle cx="200" cy="200" r="100" stroke="white" strokeWidth="0.5" />
            <line x1="0" y1="200" x2="400" y2="200" stroke="white" strokeWidth="0.3" />
            <line x1="200" y1="0" x2="200" y2="400" stroke="white" strokeWidth="0.3" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-72 h-72 pointer-events-none" aria-hidden="true">
          <svg viewBox="0 0 288 288" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-[0.04]">
            <polygon points="144,0 288,288 0,288" stroke="white" strokeWidth="1" fill="none" />
            <polygon points="144,50 238,238 50,238" stroke="white" strokeWidth="0.5" fill="none" />
          </svg>
        </div>

        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left — Get a Quote */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-2 mb-6">
                <span className="w-8 h-px bg-white/40" />
                <span className="text-xs font-semibold tracking-[0.3em] uppercase text-white/50">Get Started</span>
              </div>
              <h2 id="cta-title" className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
                Ready to upgrade your home?
              </h2>
              <p className="text-lg text-white/40 leading-relaxed mb-10 max-w-lg">
                Tell us about your space, your budget, and your vision. We will craft a furniture plan that fits — no pressure, no compromises.
              </p>
              <Link href="/contact">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-white/90 border-0 transition-all duration-200 ease-out hover:-translate-y-[1px] hover:shadow-xl hover:shadow-white/10 px-10 py-7 text-base font-semibold rounded-xl"
                >
                  Get a Free Quote
                  <span className="ml-2">→</span>
                </Button>
              </Link>
              <p className="mt-4 text-sm text-white/25">Usually responds within 2 hours</p>
            </motion.div>

            {/* Divider */}
            <div className="hidden lg:flex justify-center" aria-hidden="true">
              <div className="w-px h-48 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
            </div>

            {/* Right — View Projects */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
              className="relative"
            >
              {/* Glass card */}
              <div className="relative rounded-2xl border border-white/10 bg-white/5 p-10 backdrop-blur-sm overflow-hidden group hover:border-white/20 transition-all duration-500">
                {/* Inner glow on hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/[0.04] to-transparent" />

                {/* Corner accent */}
                <div className="absolute -top-8 -right-8 w-24 h-24 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
                  <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="96" cy="0" r="96" stroke="white" strokeWidth="0.5" />
                  </svg>
                </div>

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 mb-6">
                    <span className="w-8 h-px bg-white/40" />
                    <span className="text-xs font-semibold tracking-[0.3em] uppercase text-white/50">Portfolio</span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4 leading-snug">
                    See what we have built
                  </h3>
                  <p className="text-base text-white/40 leading-relaxed mb-8">
                    Browse completed projects across Metro Manila, Bulacan, Cavite, and beyond — from single bed frames to full-home installations.
                  </p>

                  <div className="space-y-3 mb-8">
                    {[
                      { label: "Residential Homes", count: "200+" },
                      { label: "Commercial Spaces", count: "50+" },
                      { label: "Interior Design Partners", count: "30+" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between border-b border-white/5 pb-3">
                        <span className="text-sm text-white/40">{item.label}</span>
                        <span className="text-sm font-semibold text-white/70">{item.count}</span>
                      </div>
                    ))}
                  </div>

                  <Link href="/projects">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full border-white/20 text-white/70 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all duration-200 ease-out hover:-translate-y-[1px] px-8 py-6 text-base rounded-xl"
                    >
                      View Our Projects
                      <span className="ml-2">→</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </main>
  )
}
