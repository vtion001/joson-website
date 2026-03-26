"use client"

import { motion } from "framer-motion"
import { Award, Users, Globe, Calendar, Quote, Star } from "lucide-react"
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
              <img src="/IMG20230512120029.jpg" alt="Joson Furniture workshop in Bulacan" loading="lazy" decoding="async" className="w-full h-96 object-cover rounded-2xl shadow-lg" />
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

      <section aria-labelledby="about-testimonials" role="region" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 id="about-testimonials" className="text-4xl font-bold text-foreground mb-6 text-balance">What Our Customers Say</h2>
            <p className="text-xl text-muted-foreground text-pretty">Trusted by Filipino families across the Philippines.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { q: "Buti na lang may ganito, quality na, abot-kaya pa. My AFFORDABED bed frame is super sturdy!", n: "Maria Santos", title: "Homeowner" }, 
              { q: "Perfect for our rental property. Durable, affordable, and tenants love them!", n: "Juan Cruz", title: "Property Owner" }, 
              { q: "The premium bunk bed looks amazing. Joson delivers on their Filipino craft promise.", n: "Ana Reyes", title: "Interior Designer" }
            ].map((t, i) => (
              <motion.blockquote key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative bg-card p-8 rounded-xl border border-border/60">
                <Quote className="absolute -top-3 left-6 w-6 h-6 text-primary" />
                <p className="text-muted-foreground mb-6 leading-relaxed">"{t.q}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-foreground">{t.n}</span>
                    <span className="text-sm text-muted-foreground ml-2">- {t.title}</span>
                  </div>
                  <div className="flex items-center gap-1 text-primary"><Star /><Star /><Star /><Star /><Star className="opacity-50" /></div>
                </div>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-card">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-foreground mb-4">Ready to upgrade your home?</h3>
          <p className="text-muted-foreground mb-8">Get a free quote for your next bed frame today.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/contact"><Button size="lg">Get Free Quote<span className="ml-2">→</span></Button></Link>
            <Link href="/products"><Button size="lg" variant="outline">View Products<span className="ml-2">→</span></Button></Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="about-testimonials" role="region" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 id="about-testimonials" className="text-4xl font-bold text-foreground mb-6 text-balance">Testimonials</h2>
            <p className="text-xl text-muted-foreground text-pretty">Trusted by homeowners and professionals across the Philippines.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[{ q: "Attention to detail and timely delivery.", n: "Project Manager" }, { q: "Design and build quality are exceptional.", n: "Home Owner" }, { q: "Reliable partner for complex cabinetry projects.", n: "Architect" }].map((t, i) => (
              <motion.blockquote key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative bg-card p-8 rounded-xl border border-border/60">
                <Quote className="absolute -top-3 left-6 w-6 h-6 text-primary" />
                <p className="text-muted-foreground mb-6 leading-relaxed">“{t.q}”</p>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{t.n}</span>
                  <div className="flex items-center gap-1 text-primary"><Star /><Star /><Star /><Star /><Star className="opacity-50" /></div>
                </div>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-card">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-foreground mb-4">Ready to work with ModuLux?</h3>
          <p className="text-muted-foreground mb-8">Discuss materials, timelines, and budgets with our team.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/contact"><Button size="lg">Get Free Quote<span className="ml-2">→</span></Button></Link>
            <Link href="/projects"><Button size="lg" variant="outline">View Projects<span className="ml-2">→</span></Button></Link>
          </div>
        </div>
      </section>
    </main>
  )
}
