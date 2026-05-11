import path from "path"
import { readFile, writeFile } from "fs/promises"
import { Settings as SettingsIcon, Bell, Mail, Globe, Save } from "lucide-react"
import { revalidatePath } from "next/cache"
import { SaveForm, SubmitButton } from "@/components/admin/save-form"
import { SelectOnFocusInput, SelectOnFocusTextarea } from "@/components/select-on-focus"

const settingsPath = path.join(process.cwd(), "data", "settings.json")

interface SiteSettings {
  site_name?: string
  site_description?: string
  contact_email?: string
  contact_phone?: string
  address?: string
  enable_notifications?: boolean
  enable_live_chat?: boolean
  enable_inquiry_emails?: boolean
}

async function saveSettings(prev: any, formData: FormData) {
  "use server"
  const site_name = String(formData.get("site_name") || "").trim()
  const site_description = String(formData.get("site_description") || "").trim()
  const contact_email = String(formData.get("contact_email") || "").trim()
  const contact_phone = String(formData.get("contact_phone") || "").trim()
  const address = String(formData.get("address") || "").trim()
  const enable_notifications = formData.get("enable_notifications") === "on"
  const enable_live_chat = formData.get("enable_live_chat") === "on"
  const enable_inquiry_emails = formData.get("enable_inquiry_emails") === "on"

  const raw = await readFile(settingsPath, "utf-8").catch(() => "{}")
  const prevSettings = JSON.parse(raw || "{}") as SiteSettings
  const next: SiteSettings = {
    ...prevSettings,
    site_name,
    site_description,
    contact_email,
    contact_phone,
    address,
    enable_notifications,
    enable_live_chat,
    enable_inquiry_emails,
  }
  await writeFile(settingsPath, JSON.stringify(next, null, 2))
  revalidatePath("/admin/settings")
  return { ok: true, message: "Settings saved successfully" }
}

export default async function AdminSettingsPage() {
  const raw = await readFile(settingsPath, "utf-8").catch(() => "{}")
  const settings = JSON.parse(raw || "{}") as SiteSettings

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-8">
      <div className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground animate-in fade-in slide-in-from-top-1 duration-300">
        <div className="px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-full">
              <SettingsIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-sm md:text-base/relaxed opacity-90">Manage site configuration and preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* General Settings */}
          <div className="bg-card border border-border/40 rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-1 duration-300">
            <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              General Settings
            </h2>
            <SaveForm action={saveSettings}>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2" htmlFor="site-name">
                    Site Name
                  </label>
                  <SelectOnFocusInput
                    id="site-name"
                    name="site_name"
                    defaultValue={settings.site_name || "Joson Furniture"}
                    className="w-full p-2.5 border border-border/40 rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2" htmlFor="site-description">
                    Site Description
                  </label>
                  <SelectOnFocusTextarea
                    id="site-description"
                    name="site_description"
                    defaultValue={settings.site_description || ""}
                    className="w-full p-2.5 border border-border/40 rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-24"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2" htmlFor="contact-email">
                      Contact Email
                    </label>
                    <SelectOnFocusInput
                      id="contact-email"
                      name="contact_email"
                      type="email"
                      defaultValue={settings.contact_email || ""}
                      className="w-full p-2.5 border border-border/40 rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2" htmlFor="contact-phone">
                      Contact Phone
                    </label>
                    <SelectOnFocusInput
                      id="contact-phone"
                      name="contact_phone"
                      defaultValue={settings.contact_phone || ""}
                      className="w-full p-2.5 border border-border/40 rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2" htmlFor="address">
                    Address
                  </label>
                  <SelectOnFocusTextarea
                    id="address"
                    name="address"
                    defaultValue={settings.address || ""}
                    className="w-full p-2.5 border border-border/40 rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-20"
                  />
                </div>
              </div>

              <div className="mt-6">
                <SubmitButton className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-all duration-200 ease-out transform hover:bg-primary/90 hover:-translate-y-[1px]">
                  <Save className="w-4 h-4" />
                  Save Settings
                </SubmitButton>
              </div>
            </SaveForm>
          </div>

          {/* Notification Settings */}
          <div className="bg-card border border-border/40 rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-1 duration-300">
            <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </h2>
            <SaveForm action={saveSettings}>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="enable_notifications"
                    defaultChecked={settings.enable_notifications ?? true}
                    className="size-5 rounded border-border/40 text-primary focus:ring-primary/20"
                  />
                  <div>
                    <span className="font-medium text-foreground">Enable Notifications</span>
                    <p className="text-sm text-muted-foreground">Receive browser notifications for new inquiries</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="enable_live_chat"
                    defaultChecked={settings.enable_live_chat ?? true}
                    className="size-5 rounded border-border/40 text-primary focus:ring-primary/20"
                  />
                  <div>
                    <span className="font-medium text-foreground">Enable Live Chat</span>
                    <p className="text-sm text-muted-foreground">Show live chat widget on public pages</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="enable_inquiry_emails"
                    defaultChecked={settings.enable_inquiry_emails ?? true}
                    className="size-5 rounded border-border/40 text-primary focus:ring-primary/20"
                  />
                  <div>
                    <span className="font-medium text-foreground">Inquiry Email Notifications</span>
                    <p className="text-sm text-muted-foreground">Receive email alerts for new contact form submissions</p>
                  </div>
                </label>
              </div>

              <div className="mt-6">
                <SubmitButton className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-all duration-200 ease-out transform hover:bg-primary/90 hover:-translate-y-[1px]">
                  <Save className="w-4 h-4" />
                  Save Preferences
                </SubmitButton>
              </div>
            </SaveForm>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-card border border-border/40 rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-1 duration-300">
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Quick Info
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Site Name:</span>
                <p className="font-medium text-foreground">{settings.site_name || "Joson Furniture"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Contact:</span>
                <p className="font-medium text-foreground">{settings.contact_email || "Not set"}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border/40 rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-1 duration-300">
            <h2 className="text-sm font-semibold text-foreground mb-4">Guidelines</h2>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>Site name appears in browser tabs and SEO metadata</li>
              <li>Contact email receives inquiry notifications</li>
              <li>Settings are saved to the server immediately</li>
            </ul>
          </div>

          <div className="bg-card border border-border/40 rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-1 duration-300">
            <h2 className="text-sm font-semibold text-foreground mb-4">Tips</h2>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>Keep the site description concise and informative</li>
              <li>Update contact information when details change</li>
              <li>Review notification settings periodically</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
