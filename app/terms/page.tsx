import { Metadata } from "next"
import { FileText, CheckCircle, AlertCircle, Scale, Gavel } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Terms of Service - Joson Furniture",
  description: "Joson Furniture Terms of Service - Read our terms and conditions for product purchases and services.",
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-24 bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-muted/30 blur-2xl" />
        </div>
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-6">
              <Scale className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              Terms of Service
            </h1>
            <p className="text-xl text-muted-foreground text-pretty">
              Please read these terms carefully before using our products and services.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-card border border-border/40 rounded-xl p-8 mb-8">
              <p className="text-sm text-muted-foreground mb-0">Last updated: April 8, 2026</p>
            </div>

            <div className="space-y-12">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-accent" />
                  Agreement to Terms
                </h2>
                <p className="text-muted-foreground mb-4">
                  By accessing our website or purchasing our products, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                </p>
                <p className="text-muted-foreground">
                  Joson Furniture reserves the right to modify these terms at any time. Changes will be effective immediately upon posting to our website.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-accent" />
                  Products and Services
                </h2>
                <p className="text-muted-foreground mb-4">
                  Joson Furniture offers custom-built furniture products including but not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Bed frames (AFFORDABED, Premium, and Ordinary lines)</li>
                  <li>Kitchen cabinets and modular storage solutions</li>
                  <li>Wardrobes and walk-in closets</li>
                  <li>Bespoke furniture pieces</li>
                  <li>Bathroom vanities and toilet partitions</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  All products are proudly manufactured in our workshop located at Batia, Bocaue, Bulacan, Philippines.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-accent" />
                  Pricing and Payment
                </h2>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Prices are quoted in Philippine Peso (PHP) and are subject to change without notice</li>
                  <li>A deposit of 50% is required to confirm custom orders</li>
                  <li>Balance payment is due upon delivery or before installation</li>
                  <li> We accept cash, bank transfer, and selected digital payment methods</li>
                  <li>Prices do not include delivery and installation unless specified</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-accent" />
                  Orders and Customization
                </h2>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Custom orders cannot be cancelled once production begins</li>
                  <li>Custom sizes, finishes, and configurations are non-refundable</li>
                  <li>Lead time for custom orders is typically 2-4 weeks, subject to order volume</li>
                  <li>Minor variations in color, grain, and measurements are inherent to natural materials</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-accent" />
                  Warranty
                </h2>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>All products carry a 1-year structural warranty from date of delivery</li>
                  <li>Warranty covers manufacturing defects and structural failures under normal use</li>
                  <li>Warranty does not cover damage caused by misuse, accidents, natural disasters, or unauthorized modifications</li>
                  <li> Warranty claim requires proof of purchase and inspection by our team</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <Gavel className="w-6 h-6 text-accent" />
                  Limitation of Liability
                </h2>
                <p className="text-muted-foreground">
                  Joson Furniture shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our products. Our total liability shall not exceed the purchase price of the product in question.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Governing Law
                </h2>
                <p className="text-muted-foreground">
                  These Terms of Service are governed by and construed in accordance with the laws of the Republic of the Philippines. Any disputes shall be resolved in the courts of Bulacan, Philippines.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Contact Information
                </h2>
                <p className="text-muted-foreground mb-4">
                  For questions regarding these Terms of Service, please contact us:
                </p>
                <div className="bg-card border border-border/40 rounded-xl p-6">
                  <p className="font-medium text-foreground">Joson Furniture</p>
                  <p className="text-muted-foreground">Batia, Bocaue, Bulacan, Philippines</p>
                  <p className="text-muted-foreground">Phone: +63 917 133 8888</p>
                  <p className="text-muted-foreground">Email: legal@josonfurniture.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-foreground mb-4">Ready to start your project?</h3>
          <p className="text-muted-foreground mb-8">Get in touch with our team to discuss your furniture needs.</p>
          <Link href="/contact">
            <Button size="lg">Contact Us</Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
