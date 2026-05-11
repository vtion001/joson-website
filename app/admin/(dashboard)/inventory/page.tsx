"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  History,
  Building2,
  RefreshCw,
} from "lucide-react"

type Material = {
  id: string
  name: string
  category: string
  subcategory: string
  unit: string
  unit_size_sqft: number | null
  cost_price: number
  sell_price: number
  supplier_id: string | null
  supplier_name?: string
  supplier_sku: string | null
  in_stock: boolean
  stock_qty: number
  min_stock_level: number
  lead_time_days: number
  notes: string | null
  is_active: boolean
  updated_at: string
}

type Supplier = {
  id: string
  name: string
  contact_person: string | null
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
  is_active: boolean
}

type PriceHistoryEntry = {
  id: string
  material_id: string
  material_name: string
  old_price: number | null
  new_price: number
  price_type: string
  changed_by: string | null
  changed_at: string
}

type PricingConfig = {
  key: string
  value: Record<string, number>
  description: string | null
}

const CATEGORY_LABELS: Record<string, string> = {
  sheet_goods: "Sheet Goods",
  hardware: "Hardware",
  finish: "Finish",
  labor: "Labor",
  accessory: "Accessory",
}

const CATEGORY_COLORS: Record<string, string> = {
  sheet_goods: "bg-blue-100 text-blue-800",
  hardware: "bg-amber-100 text-amber-800",
  finish: "bg-purple-100 text-purple-800",
  labor: "bg-green-100 text-green-800",
  accessory: "bg-gray-100 text-gray-800",
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v)
}

function MaterialForm({
  material,
  suppliers,
  onSave,
  onClose,
}: {
  material?: Material
  suppliers: Supplier[]
  onSave: (m: Partial<Material>) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState<Partial<Material>>(
    material || {
      name: "",
      category: "sheet_goods",
      subcategory: "",
      unit: "sheet",
      unit_size_sqft: 32,
      cost_price: 0,
      sell_price: 0,
      supplier_id: null,
      supplier_sku: "",
      in_stock: true,
      stock_qty: 0,
      min_stock_level: 0,
      lead_time_days: 0,
      notes: "",
      is_active: true,
    }
  )
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!form.name?.trim()) {
      toast.error("Material name is required")
      return
    }
    if (form.cost_price! <= 0 || form.sell_price! <= 0) {
      toast.error("Prices must be greater than 0")
      return
    }
    setSaving(true)
    try {
      await onSave(form)
      toast.success(material ? "Material updated" : "Material added")
      onClose()
    } catch {
      toast.error("Failed to save material")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Material Name *</Label>
          <Input
            value={form.name || ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder={'e.g. 3/4" Melamine-Faced Plywood'}
          />
        </div>
        <div>
          <Label>Category *</Label>
          <Select
            value={form.category || "sheet_goods"}
            onValueChange={(v) => setForm({ ...form, category: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sheet_goods">Sheet Goods</SelectItem>
              <SelectItem value="hardware">Hardware</SelectItem>
              <SelectItem value="finish">Finish</SelectItem>
              <SelectItem value="labor">Labor</SelectItem>
              <SelectItem value="accessory">Accessory</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Unit *</Label>
          <Select
            value={form.unit || "sheet"}
            onValueChange={(v) => setForm({ ...form, unit: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sheet">Sheet (4×8 ft)</SelectItem>
              <SelectItem value="piece">Piece</SelectItem>
              <SelectItem value="set">Set</SelectItem>
              <SelectItem value="pair">Pair</SelectItem>
              <SelectItem value="box">Box</SelectItem>
              <SelectItem value="meter">Meter (lm)</SelectItem>
              <SelectItem value="sqft">Square Feet</SelectItem>
              <SelectItem value="sqm">Square Meters</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Subcategory</Label>
          <Input
            value={form.subcategory || ""}
            onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
            placeholder="e.g. Plywood, Hinge, Laminate"
          />
        </div>
        <div>
          <Label>Unit Size (sqft)</Label>
          <Input
            type="number"
            value={form.unit_size_sqft || ""}
            onChange={(e) =>
              setForm({ ...form, unit_size_sqft: parseFloat(e.target.value) || null })
            }
            placeholder="32 for 4×8 sheet"
          />
        </div>
        <div>
          <Label>Cost Price (PHP) *</Label>
          <Input
            type="number"
            value={form.cost_price || ""}
            onChange={(e) =>
              setForm({ ...form, cost_price: parseFloat(e.target.value) || 0 })
            }
            placeholder="0"
          />
        </div>
        <div>
          <Label>Sell Price (PHP) *</Label>
          <Input
            type="number"
            value={form.sell_price || ""}
            onChange={(e) =>
              setForm({ ...form, sell_price: parseFloat(e.target.value) || 0 })
            }
            placeholder="0"
          />
        </div>
        <div>
          <Label>Supplier</Label>
          <Select
            value={form.supplier_id || "none"}
            onValueChange={(v) =>
              setForm({ ...form, supplier_id: v === "none" ? null : v })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No supplier</SelectItem>
              {suppliers.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Supplier SKU</Label>
          <Input
            value={form.supplier_sku || ""}
            onChange={(e) => setForm({ ...form, supplier_sku: e.target.value })}
            placeholder="Supplier part number"
          />
        </div>
        <div>
          <Label>Stock Qty</Label>
          <Input
            type="number"
            value={form.stock_qty || 0}
            onChange={(e) =>
              setForm({ ...form, stock_qty: parseFloat(e.target.value) || 0 })
            }
          />
        </div>
        <div>
          <Label>Min Stock Level</Label>
          <Input
            type="number"
            value={form.min_stock_level || 0}
            onChange={(e) =>
              setForm({ ...form, min_stock_level: parseFloat(e.target.value) || 0 })
            }
          />
        </div>
        <div>
          <Label>Lead Time (days)</Label>
          <Input
            type="number"
            value={form.lead_time_days || 0}
            onChange={(e) =>
              setForm({ ...form, lead_time_days: parseInt(e.target.value) || 0 })
            }
          />
        </div>
        <div className="flex items-center gap-3 pt-6">
          <input
            type="checkbox"
            id="in_stock"
            checked={form.in_stock ?? true}
            onChange={(e) => setForm({ ...form, in_stock: e.target.checked })}
            className="w-4 h-4"
          />
          <Label htmlFor="in_stock" className="cursor-pointer">
            In Stock
          </Label>
        </div>
        <div className="flex items-center gap-3 pt-6">
          <input
            type="checkbox"
            id="is_active"
            checked={form.is_active ?? true}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            className="w-4 h-4"
          />
          <Label htmlFor="is_active" className="cursor-pointer">
            Active
          </Label>
        </div>
        <div className="col-span-2">
          <Label>Notes</Label>
          <Input
            value={form.notes || ""}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Optional notes"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : material ? "Update Material" : "Add Material"}
        </Button>
      </DialogFooter>
    </div>
  )
}

function SupplierForm({
  supplier,
  onSave,
  onClose,
}: {
  supplier?: Supplier
  onSave: (s: Partial<Supplier>) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState<Partial<Supplier>>(
    supplier || { name: "", contact_person: "", phone: "", email: "", address: "", notes: "", is_active: true }
  )
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!form.name?.trim()) {
      toast.error("Supplier name is required")
      return
    }
    setSaving(true)
    try {
      await onSave(form)
      toast.success(supplier ? "Supplier updated" : "Supplier added")
      onClose()
    } catch {
      toast.error("Failed to save supplier")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Supplier Name *</Label>
          <Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Bulacan Woodworks Supply" />
        </div>
        <div>
          <Label>Contact Person</Label>
          <Input value={form.contact_person || ""} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} />
        </div>
        <div>
          <Label>Phone</Label>
          <Input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <Label>Address</Label>
          <Input value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
        <div className="col-span-2 flex items-center gap-3">
          <input type="checkbox" id="s_active" checked={form.is_active ?? true} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4" />
          <Label htmlFor="s_active" className="cursor-pointer">Active</Label>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : supplier ? "Update Supplier" : "Add Supplier"}</Button>
      </DialogFooter>
    </div>
  )
}

export default function InventoryPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>([])
  const [pricingConfig, setPricingConfig] = useState<PricingConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [matDialog, setMatDialog] = useState<Material | undefined>()
  const [supDialog, setSupDialog] = useState<Supplier | undefined>()
  const [showMatForm, setShowMatForm] = useState(false)
  const [showSupForm, setShowSupForm] = useState(false)
  const [search, setSearch] = useState("")
  const [catFilter, setCatFilter] = useState("all")

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [matRes, supRes, histRes, cfgRes] = await Promise.all([
        fetch("/api/inventory/materials"),
        fetch("/api/inventory/suppliers"),
        fetch("/api/inventory/price-history"),
        fetch("/api/inventory/pricing-config"),
      ])
      if (matRes.ok) setMaterials(await matRes.json())
      if (supRes.ok) setSuppliers(await supRes.json())
      if (histRes.ok) setPriceHistory(await histRes.json())
      if (cfgRes.ok) setPricingConfig(await cfgRes.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const saveMaterial = async (data: Partial<Material>) => {
    const res = await fetch("/api/inventory/materials", {
      method: matDialog ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(await res.text())
    await fetchAll()
  }

  const deleteMaterial = async (id: string) => {
    if (!confirm("Archive this material?")) return
    await fetch(`/api/inventory/materials?id=${id}`, { method: "DELETE" })
    toast.success("Material archived")
    await fetchAll()
  }

  const saveSupplier = async (data: Partial<Supplier>) => {
    const res = await fetch("/api/inventory/suppliers", {
      method: supDialog ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(await res.text())
    await fetchAll()
  }

  const deleteSupplier = async (id: string) => {
    if (!confirm("Deactivate this supplier?")) return
    await fetch(`/api/inventory/suppliers?id=${id}`, { method: "DELETE" })
    toast.success("Supplier deactivated")
    await fetchAll()
  }

  const updateConfig = async (key: string, value: Record<string, number>) => {
    const res = await fetch("/api/inventory/pricing-config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    })
    if (!res.ok) throw new Error(await res.text())
    toast.success("Config updated")
    await fetchAll()
  }

  const filteredMaterials = materials.filter((m) => {
    const matchSearch =
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.supplier_sku || "").toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === "all" || m.category === catFilter
    return matchSearch && matchCat
  })

  const lowStockItems = materials.filter(
    (m) => m.in_stock && m.stock_qty > 0 && m.stock_qty <= m.min_stock_level
  )
  const outOfStock = materials.filter(
    (m) => m.in_stock && m.stock_qty <= 0
  )

  const lowStockCost = lowStockItems.reduce((s, m) => s + m.cost_price * (m.min_stock_level - m.stock_qty), 0)

  const suppliersMap = Object.fromEntries(suppliers.map((s) => [s.id, s.name]))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">
            {materials.filter((m) => m.is_active).length} active materials · {suppliers.length} suppliers
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setSupDialog(undefined); setShowSupForm(true) }}>
            <Building2 className="w-4 h-4 mr-2" />
            Add Supplier
          </Button>
          <Button onClick={() => { setMatDialog(undefined); setShowMatForm(true) }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Material
          </Button>
        </div>
      </div>

      {/* Alert Cards */}
      {(lowStockItems.length > 0 || outOfStock.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {outOfStock.length > 0 && (
            <Card className="border-red-300 bg-red-50 dark:bg-red-950/20">
              <CardContent className="flex items-center gap-4 p-4">
                <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-800 dark:text-red-200">
                    {outOfStock.length} Material{outOfStock.length > 1 ? "s" : ""} Out of Stock
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {outOfStock.map((m) => m.name).join(", ")}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          {lowStockItems.length > 0 && (
            <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20">
              <CardContent className="flex items-center gap-4 p-4">
                <Package className="w-8 h-8 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-amber-800 dark:text-amber-200">
                    {lowStockItems.length} Material{lowStockItems.length > 1 ? "s" : ""} Below Min Level
                  </p>
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    Reorder cost: ~{formatCurrency(lowStockCost)} to restore stock
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Tabs defaultValue="materials">
        <TabsList>
          <TabsTrigger value="materials">Materials ({filteredMaterials.length})</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers ({suppliers.length})</TabsTrigger>
          <TabsTrigger value="config">Pricing Config</TabsTrigger>
          <TabsTrigger value="history">
            <History className="w-4 h-4 mr-1" />
            Price History
          </TabsTrigger>
        </TabsList>

        {/* ── MATERIALS TAB ── */}
        <TabsContent value="materials" className="space-y-4">
          <div className="flex gap-3 items-center">
            <Input
              placeholder="Search materials or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="sheet_goods">Sheet Goods</SelectItem>
                <SelectItem value="hardware">Hardware</SelectItem>
                <SelectItem value="finish">Finish</SelectItem>
                <SelectItem value="labor">Labor</SelectItem>
                <SelectItem value="accessory">Accessory</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Sell</TableHead>
                  <TableHead className="text-right">Margin</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No materials found. Add your first material above.
                    </TableCell>
                  </TableRow>
                )}
                {filteredMaterials.map((m) => {
                  const margin =
                    m.cost_price > 0
                      ? (((m.sell_price - m.cost_price) / m.cost_price) * 100).toFixed(0)
                      : "—"
                  return (
                    <TableRow
                      key={m.id}
                      className={!m.is_active ? "opacity-50" : ""}
                    >
                      <TableCell>
                        <div className="font-medium">{m.name}</div>
                        {m.supplier_sku && (
                          <div className="text-xs text-muted-foreground">SKU: {m.supplier_sku}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={CATEGORY_COLORS[m.category] || "bg-gray-100"}>
                          {CATEGORY_LABELS[m.category] || m.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {m.unit}
                          {m.unit_size_sqft && ` (${m.unit_size_sqft} sqft)`}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(m.cost_price)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(m.sell_price)}</TableCell>
                      <TableCell className="text-right">
                        {margin !== "—" ? (
                          <span
                            className={
                              parseFloat(margin) > 40
                                ? "text-green-600 font-medium"
                                : parseFloat(margin) < 20
                                ? "text-red-600"
                                : ""
                            }
                          >
                            {margin}%
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        {m.supplier_id ? (
                          <span className="text-sm">{suppliersMap[m.supplier_id] || "—"}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div
                          className={`text-sm font-medium ${
                            m.stock_qty <= 0
                              ? "text-red-600"
                              : m.stock_qty <= m.min_stock_level
                              ? "text-amber-600"
                              : "text-foreground"
                          }`}
                        >
                          {m.stock_qty} {m.unit}
                        </div>
                        {!m.in_stock && (
                          <div className="text-xs text-red-500">Out of Stock</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={() => {
                              setMatDialog(m)
                              setShowMatForm(true)
                            }}
                            className="p-1.5 hover:bg-muted rounded"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteMaterial(m.id)}
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ── SUPPLIERS TAB ── */}
        <TabsContent value="suppliers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.length === 0 && (
              <p className="col-span-3 text-center py-8 text-muted-foreground">
                No suppliers yet. Add your first supplier.
              </p>
            )}
            {suppliers.map((s) => (
              <Card key={s.id} className={!s.is_active ? "opacity-50" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>{s.name}</span>
                    {!s.is_active && <Badge variant="secondary">Inactive</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  {s.contact_person && <p>👤 {s.contact_person}</p>}
                  {s.phone && <p>📞 {s.phone}</p>}
                  {s.email && <p>📧 {s.email}</p>}
                  {s.address && <p className="text-muted-foreground">{s.address}</p>}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setSupDialog(s); setShowSupForm(true) }}
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteSupplier(s.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── PRICING CONFIG TAB ── */}
        <TabsContent value="config" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            These values drive the estimator. Update them when material costs change — the calculator pulls live from here.
          </p>
          {pricingConfig.map((cfg) => (
            <Card key={cfg.key}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base capitalize">
                  {cfg.key.replace(/_/g, " ")}
                </CardTitle>
                {cfg.description && (
                  <p className="text-xs text-muted-foreground">{cfg.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(cfg.value).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-2">
                      <span className="text-sm font-medium capitalize min-w-24">{k.replace(/_/g, " ")}</span>
                      <Input
                        type="number"
                        className="w-32"
                        value={v}
                        onChange={(e) =>
                          updateConfig(cfg.key, {
                            ...cfg.value,
                            [k]: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── PRICE HISTORY TAB ── */}
        <TabsContent value="history">
          {priceHistory.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No price changes recorded yet. Prices will appear here when updated.
            </p>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Old Price</TableHead>
                    <TableHead className="text-right">New Price</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {priceHistory.map((h) => {
                    const change =
                      h.old_price != null
                        ? (((h.new_price - h.old_price) / h.old_price) * 100).toFixed(1)
                        : null
                    return (
                      <TableRow key={h.id}>
                        <TableCell className="whitespace-nowrap">
                          {new Date(h.changed_at).toLocaleDateString("en-PH", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="font-medium">{h.material_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{h.price_type.replace("_", " ")}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {h.old_price != null ? formatCurrency(h.old_price) : "—"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(h.new_price)}
                        </TableCell>
                        <TableCell className="text-right">
                          {change != null && (
                            <span
                              className={`flex items-center justify-end gap-1 ${
                                parseFloat(change) > 0 ? "text-red-600" : "text-green-600"
                              }`}
                            >
                              {parseFloat(change) > 0 ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : (
                                <TrendingDown className="w-3 h-3" />
                              )}
                              {parseFloat(change) > 0 ? "+" : ""}
                              {change}%
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Material Dialog */}
      <Dialog open={showMatForm} onOpenChange={setShowMatForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {matDialog ? `Edit Material: ${matDialog.name}` : "Add New Material"}
            </DialogTitle>
          </DialogHeader>
          <MaterialForm
            material={matDialog}
            suppliers={suppliers}
            onSave={saveMaterial}
            onClose={() => setShowMatForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Supplier Dialog */}
      <Dialog open={showSupForm} onOpenChange={setShowSupForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {supDialog ? `Edit Supplier: ${supDialog.name}` : "Add New Supplier"}
            </DialogTitle>
          </DialogHeader>
          <SupplierForm
            supplier={supDialog}
            onSave={saveSupplier}
            onClose={() => setShowSupForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
