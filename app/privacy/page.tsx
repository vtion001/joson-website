import { Metadata } from "next"
import { Shield, Lock, Eye, FileText, Users, Mail } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Privacy Policy - Joson Furniture",
  description: "Joson Furniture Privacy Policy - Learn how we collect, use, and protect your personal information.",
}

export default function PrivacyPage() {
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
              <Shield className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              Privacy Policy
            </h1>
            <p className="text-xl text-muted-foreground text-pretty">
              Your privacy matters to us. This policy explains how Joson Furniture collects, uses, and protects your information.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose prose-lg prose-neutral dark:prose-invert">
            <div className="bg-card border border-border/40 rounded-xl p-8 mb-8">
              <p className="text-sm text-muted-foreground mb-0">Last updated: April 8, 2026</p>
            </div>

            <div className="space-y-12">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <Lock className="w-6 h-6 text-accent" />
                  Information We Collect
                </h2>
                <p className="text-muted-foreground mb-4">
                  At Joson Furniture, we collect information you provide directly to us, including:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Contact information such as name, email address, phone number, and delivery address</li>
                  <li>Business information for corporate clients (company name, TIN, etc.)</li>
                  <li>Project details and requirements when you request a quote</li>
                  <li>Communication preferences and chat history when you interact with our team</li>
                  <li>Website usage data through cookies and analytics tools</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <Eye className="w-6 h-6 text-accent" />
                  How We Use Your Information
                </h2>
                <p className="text-muted-foreground mb-4">
                  We use the collected information to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Process and fulfill product orders and delivery requests</li>
                  <li>Provide customer support and respond to inquiries</li>
                  <li>Send order updates, delivery notifications, and promotional materials (with consent)</li>
                  <li>Improve our products, services, and website experience</li>
                  <li>Comply with legal obligations and business regulations in the Philippines</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-accent" />
                  Information Sharing
                </h2>
                <p className="text-muted-foreground mb-4">
                  We do not sell your personal information. We may share your information with:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Service providers who assist in delivery, payment processing, and installation</li>
                  <li>Business partners with your explicit consent for joint promotions</li>
                  <li>Legal authorities when required by Philippine law</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <Users className="w-6 h-6 text-accent" />
                  Your Rights
                </h2>
                <p className="text-muted-foreground mb-4">
                  Under the Philippines Data Privacy Act of 2012, you have the right to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Access your personal information</li>
                  <li>Correct any inaccurate data</li>
                  <li>Request deletion of your data (subject to legal retention requirements)</li>
                  <li>Opt out of marketing communications</li>
                  <li>File complaints with the National Privacy Commission</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <Mail className="w-6 h-6 text-accent" />
                  Contact Us
                </h2>
                <p className="text-muted-foreground mb-4">
                  If you have questions about this Privacy Policy or wish to exercise your data rights, contact us:
                </p>
                <div className="bg-card border border-border/40 rounded-xl p-6">
                  <p className="font-medium text-foreground">Joson Furniture</p>
                  <p className="text-muted-foreground">Batia, Bocaue, Bulacan, Philippines</p>
                  <p className="text-muted-foreground">Phone: +63 917 133 8888</p>
                  <p className="text-muted-foreground">Email: privacy@josonfurniture.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-foreground mb-4">Have questions about your privacy?</h3>
          <p className="text-muted-foreground mb-8">Our team is here to help with any concerns you may have.</p>
          <Link href="/contact">
            <Button size="lg">Contact Us</Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
