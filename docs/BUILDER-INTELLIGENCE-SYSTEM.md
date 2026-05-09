# Builder Intelligence System — Strategy & Roadmap
**Project:** Joson Furniture Cabinet Estimator → Full-Stack Builder Platform
**Date:** May 10, 2026
**Status:** ✅ Phase 1 (Inventory) + Phase 2 (Live Calculator) + Phase 3 (PDF Extractor) + Phase 4 (Proposals) COMPLETE

---

## Executive Summary

After comprehensive parallel research across 4 domains (competitor calculators, PDF extraction tools, PH market benchmarks, UX best practices), the verdict is clear:

> **YES — Inventory Management is mandatory before any pricing or PDF work.**
> Without it, the calculator runs on hardcoded static values. With it, every estimate is data-driven, every price change propagates instantly, and the PDF extractor has a real pricing database to work against.

---

## Research Findings Summary

### 1. Philippine Cabinet Market Benchmarks

| Tier | Price Range (PHP/LM) | Joson Position |
|------|---------------------|----------------|
| Economy | ₱4,000–₱8,000/LM | — |
| Standard | ₱8,000–₱15,000/LM | ✅ Current sweet spot |
| Premium | ₱15,000–₱28,000/LM | ✅ Target upgrade |
| Luxury | ₱28,000–₱55,000/LM | Aspirational |

**Current Joson base rates (from calculator-pricing.json):**
- Base cabinet: ₱40,476/sheet or ~₱2,000–₱5,000/LM (after multipliers)
- Hanging: ₱38,453/sheet
- Tall: ₱65,182/sheet

These are **sheet-based rates** feeding into a per-linear-meter calculator. This is the right model — but the numbers need validation against current Bulacan supplier prices.

**Sheet good standard in PH: 4×8 ft (1220mm × 2440mm) = 32 sq ft**

### 2. PDF Floor Plan Extraction — Recommended Architecture

```
PDF Upload
    ↓
PyMuPDF (render page → 300 DPI PNG)
    ↓
Claude 3.5 Haiku / Gemini Flash (vision analysis)
    ↓
Structured JSON: rooms, dimensions, cabinet locations
    ↓
Pricing Engine (reads from Inventory DB)
    ↓
Quote Output (PDF / WhatsApp / Email)
```

**Key tools:**
- **PyMuPDF** (free, AGPL) — PDF rendering + text extraction
- **Claude 3.5 Haiku** (~$0.003/image) — vision analysis, cheapest capable model
- **Gemini 1.5 Flash** (free tier available) — alternative vision API
- **NO specialized floor plan AI needed for MVP** — general vision models work

### 3. Competitor UX Patterns

- IKEA Kitchen Planner: 3D drag-drop, session save, expert CTA
- QuoteFlux: calculator → lead capture → CRM pipeline
- Best pattern: **Step-by-step wizard** → real-time summary → PDF export

### 4. What Makes Estimators Convert

1. Real-time price updates on every input change
2. Itemized breakdown (not a lump sum)
3. Save/share estimate via link
4. Mobile-responsive
5. Trust signals ("estimate only, final quote may vary")
6. Clear consultation CTA after estimate

---

## Architecture: The Complete System

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 14)                │
├──────────┬──────────┬──────────┬──────────┬────────────┤
│ Calculator│ PDF Plan │ Proposal │  Admin   │  Client    │
│  Tool     │ Extractor│ Generator│ Dashboard│ Portal     │
└────┬─────┴────┬─────┴────┬─────┴────┬─────┴────┬──────┘
     │           │          │          │          │
┌────▼───────────▼──────────▼──────────▼──────────▼──────┐
│              API ROUTES (Next.js Route Handlers)         │
│  /api/estimate  /api/inventory  /api/pdf-extract        │
│  /api/proposals  /api/materials   /api/suppliers        │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│              DATA LAYER (Supabase PostgreSQL)            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │Inventory │  │ Supabase  │  │ Supplier │  │  Price │ │
│  │ Materials│  │  Projects │  │  Records │  │ History│ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Build Phases

### PHASE 1 — Inventory Management System (THIS WEEK)
**Goal:** Replace static `calculator-pricing.json` with a live Supabase database.

**Deliverables:**
- [ ] Supabase schema: materials, suppliers, price_history, unit_conversions
- [ ] Admin UI: Add/Edit/Archive materials
- [ ] Admin UI: Supplier management
- [ ] API routes: CRUD for inventory
- [ ] Calculator refactor: pulls from Supabase, not JSON
- [ ] Price history tracking (every price change logged)
- [ ] Low stock alerts config
- [ ] Sheet utilization calculator (how many sheets per LM)

**Schema design:**
```sql
-- Core materials table
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'sheet_goods', 'hardware', 'finish', 'labor'
  subcategory TEXT, -- 'plywood', 'melamine', 'hinge', 'handle', etc.
  unit TEXT NOT NULL, -- 'sheet', 'piece', 'set', 'lm', 'sqm'
  unit_size NUMERIC, -- e.g., 32 for 4x8 sheets in sqft
  unit_conversion NUMERIC, -- to base unit
  cost_price NUMERIC NOT NULL DEFAULT 0,
  sell_price NUMERIC NOT NULL DEFAULT 0,
  markup_percent NUMERIC DEFAULT 0,
  supplier_id UUID REFERENCES suppliers(id),
  supplier_sku TEXT,
  in_stock BOOLEAN DEFAULT true,
  min_stock_level NUMERIC DEFAULT 0,
  lead_time_days INTEGER DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Price history
CREATE TABLE material_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID REFERENCES materials(id),
  old_price NUMERIC,
  new_price NUMERIC NOT NULL,
  changed_by TEXT, -- 'admin', 'auto_import', 'bulk_update'
  changed_at TIMESTAMPTZ DEFAULT now()
);

-- Suppliers
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### PHASE 2 — Calculator UX Overhaul
**Goal:** Rebuild the calculator with inventory-backed pricing + better UX.

**Deliverables:**
- [ ] Tier structure mapped to inventory (Economy/Standard/Premium/Luxury)
- [ ] Material selector shows actual inventory items, not just generic types
- [ ] Live stock availability check in calculator
- [ ] Per-cabinet-unit breakdown instead of just lump sum
- [ ] "Save Estimate" — generates shareable link with estimate state
- [ ] Add-on selector (lazy susan, corner solutions, lighting, accessories)
- [ ] Door/drawer ratio selector
- [ ] Regional pricing multiplier (NCR vs Bulacan vs Provincial)
- [ ] Real-time comparison: "With this material upgrade, add ₱X"

---

### PHASE 3 — PDF Floor Plan Extractor
**Goal:** Upload architectural plans → AI analysis → auto-generated estimates.

**Deliverables:**
- [ ] `/api/pdf-extract` route: PDF upload → PyMuPDF render → Claude vision → JSON
- [ ] Frontend: drag-drop PDF upload with preview
- [ ] Floor plan parsing: room names, dimensions, cabinet zones
- [ ] AI confidence scoring (what it understood vs needs verification)
- [ ] Manual override UI for AI-extracted dimensions
- [ ] "Send to Calculator" — pre-fills estimate from PDF analysis
- [ ] PDF analysis history (store past analyses)

**Tech stack:**
- PyMuPDF (`pip install pymupdf`) — PDF processing
- Claude 3.5 Haiku vision API — floor plan analysis
- Next.js API route — orchestration layer

---

### PHASE 4 — Proposal Generator
**Goal:** Professional PDF proposals from estimates.

**Deliverables:**
- [ ] Branded PDF proposal template (Joson letterhead)
- [ ] Line-item breakdown: materials, labor, hardware, finish
- [ ] Terms & conditions section
- [ ] Valid-until date on proposals
- [ ] Auto-numbered proposal reference (JOSON-2026-XXXX)
- [ ] WhatsApp delivery of proposal PDF
- [ ] Email delivery
- [ ] Proposal status tracking (sent → viewed → approved/rejected)
- [ ] Proposal templates per project type (kitchen vs bathroom vs bedroom)

---

### PHASE 5 — Admin Dashboard Intelligence
**Goal:** Unified view of inventory, leads, projects, and financials.

**Deliverables:**
- [ ] Inventory dashboard: low stock, price changes this week, supplier performance
- [ ] Lead pipeline from estimates (estimate → inquiry → project → closed)
- [ ] Project tracker (cabinet projects in progress)
- [ ] Revenue tracking per month
- [ ] Material cost vs selling price margin tracker
- [ ] Supplier scorecard (on-time delivery %, price stability)

---

### PHASE 6 — Advanced Intelligence (Future)
**Goal:** Differentiate from any competitor in the PH market.

**Ideas:**
- [ ] Cut optimization algorithm (Minimize sheet waste)
- [ ] Material waste estimator per project
- [ ] 3D cabinet preview from estimate data
- [ ] WhatsApp chatbot for estimate follow-ups
- [ ] Client portal: track project progress with photos
- [ ] AI "estimate audit" — flags unrealistic low/high estimates

---

## Current Estimator Issues to Fix (Quick Wins)

1. **Stale pricing data** — `calculator-pricing.json` has hardcoded rates from unknown date
2. **No material-level breakdown** — users see total, not per-component cost
3. **No PDF export** — can't share estimates professionally
4. **No floor plan input** — requires manual linear meter entry
5. **No inventory sync** — prices don't reflect actual supplier costs
6. **Tier naming mismatch** — calculator uses "basic/premium/luxury" but pricing JSON uses "luxury/premium/standard"

---

## Implementation Order

```
Phase 1  → Supabase Schema + Inventory Admin UI
Phase 1b → Calculator refactor to use Supabase
Phase 2  → Calculator UX overhaul
Phase 3  → PDF Plan Extractor
Phase 4  → Proposal Generator
Phase 5  → Admin Intelligence Dashboard
Phase 6  → Advanced features
```
