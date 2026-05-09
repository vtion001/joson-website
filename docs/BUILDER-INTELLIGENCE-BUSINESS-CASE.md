# Builder Intelligence System — How It Works & Why It Matters for Joson Furniture

---

## The Problem Joson Faces

Every cabinet business runs on estimates. Joson is no different — a client asks "how much for my kitchen?" and someone spends hours calculating material costs, labor, hardware, and finish by hand or in a spreadsheet.

The old way has three fatal flaws:
1. **Prices go stale** — material costs change but estimates don't update
2. **No follow-up system** — an estimate goes out and vanishes. Was it approved? Rejected? Forgotten?
3. **No visibility** — the owner doesn't know how many estimates were sent this month, how many became projects, or which materials are running low

---

## How the Builder Intelligence System Works

The system is built in 4 phases that stack on each other. Each phase unlocks a new capability.

---

### Phase 1 — Inventory Management
**What it is:** A live database of every material Joson stocks — plywood, hardware, finishes, labor rates — with real supplier prices and current stock levels.

**How it works:**
- All materials stored in MySQL with: name, category, unit size, cost price, sell price, stock quantity, supplier, lead time
- Admin UI at `/admin/inventory` lets you add, edit, or archive materials in seconds
- Stock levels auto-update when projects are confirmed

**How it helps the business:**
- Prices are always current — update one field, every future estimate reflects the new price
- Know instantly if a material is in stock or needs to be ordered
- Cost vs. sell price margin is visible, so you never underprice a job
- Supplier SKUs tracked for easy re-ordering

**Example:** Client asks about a kitchen. You check inventory — marine plywood is in stock at Wilcon. You use that price in the estimate, knowing it's accurate.

---

### Phase 2 — Smart Calculator
**What it is:** The calculator on the website pulls live prices from the inventory database. Every estimate is calculated using real-time data.

**How it works:**
- User inputs: linear meters, cabinet type (base/hanging/tall), material tier (standard/premium/luxury), finish, hardware level
- Calculator fetches current sell prices from MySQL
- Outputs: itemized breakdown — materials cost, labor, hardware, finish, subtotal, VAT, total

**How it helps the business:**
- Eliminates manual calculation errors
- Shows clients exactly where the price comes from — builds trust
- Can be used by anyone in the team, not just the owner
- Discounts can be applied cleanly with audit trail

**Example:** A client questions why the kitchen is ₱280,000. You show them the breakdown: 18 linear meters × ₱8,500 base rate + hardware + finish = ₱280,000. No argument.

---

### Phase 3 — Floor Plan PDF Extractor
**What it is:** Upload an architectural floor plan (PDF) and AI reads it — identifies rooms, dimensions, and cabinet zones automatically.

**How it works:**
- Client sends architect's floor plan PDF
- System renders each page as an image
- Google Gemini AI (free) analyzes the image and extracts: room names, dimensions, wall lengths, areas
- Staff reviews and corrects the AI extraction if needed
- Data pre-fills the calculator with one click

**How it helps the business:**
- Faster measurement — no manual dimension entry
- Less human error in takeoff
- Professional impression — Joson is using AI-powered tools
- Works with any PDF floor plan, not just specific formats

**Example:** Architect sends a PDF. Upload it, AI extracts "Kitchen 4.2m × 3.8m, L-shaped, upper cabinets north wall 4.2m, lower cabinets south wall 3.8m." Pre-fills calculator. Done in 30 seconds.

---

### Phase 4 — Proposal Generator
**What it is:** Turn any estimate into a professional PDF proposal with Joson branding, line-item breakdown, terms, and valid-until date.

**How it works:**
- After calculating an estimate, save it to `/admin/proposals`
- Fill in client name, email, phone, project type, notes
- Download branded A4 PDF — looks like it came from a professional estimating system
- Track status: Draft → Sent → Approved/Rejected → In Project

**How it helps the business:**
- First impression matters — a branded PDF proposal builds credibility
- Reference numbers (JOSON-2026-0001) make it feel like a real business
- Valid-until date creates urgency ("this price holds until June 10, 2026")
- Status tracking means no estimate falls through the cracks

**Example:** Client gets a PDF that looks like it came from a multinational fit-out company. They're more likely to take it seriously and approve it.

---

## The Full Client Journey (How It All Connects)

```
Client sends floor plan PDF
        ↓
AI extracts dimensions (Phase 3)
        ↓
Calculator auto-fills with live prices (Phase 2)
        ↓
Staff reviews, adjusts, generates quote
        ↓
Branded PDF proposal sent to client (Phase 4)
        ↓
Client approves → Project created
        ↓
Materials reserved from inventory (Phase 1)
        ↓
Project tracked through to completion
```

---

## Business Impact Summary

| Problem | Solution | Impact |
|---------|----------|--------|
| Stale prices | Live MySQL inventory | Never over/underprice again |
| Manual calculations | Smart calculator | Faster estimates, fewer errors |
| Slow measurement | AI floor plan extraction | 30-second takeoffs |
| Unprofessional quotes | Branded PDF proposals | Client takes you seriously |
| Lost estimates | Status tracking | Follow up on every lead |
| No visibility | Dashboard (Phase 5) | Know your pipeline at a glance |
| Running out of stock mid-job | Low stock alerts | Never delay a project |
| Don't know margins | Cost vs sell tracker | Price profitably every time |

---

## What Phase 5 Adds — Admin Intelligence Dashboard

Phase 5 is the layer that ties everything together into actionable business intelligence:

- **Lead Pipeline** — See every estimate by status. How many drafts, how many sent, how many approved this month? Know your conversion rate.
- **Project Tracker** — Which jobs are in progress? What materials are allocated?
- **Revenue Tracking** — Monthly revenue from approved estimates. See trends over time.
- **Low Stock Alerts** — Get notified when a key material drops below minimum stock level before it affects a project.
- **Margin Tracker** — See cost price vs. sell price per project. Know if you're actually making money or just busy.
- **Supplier Scorecard** — Which suppliers deliver on time? Whose prices are most stable?

---

## Why This Matters for Joson Right Now

Joson is rebuilding after the cabinetry business restructure. The opportunity is to build a system that:
1. **Attracts better clients** — professional proposals and fast turnaround signal a real business
2. **Protects margins** — live pricing + margin tracking means every job is profitable
3. **Creates operational leverage** — staff can run the calculator without the owner having to be involved in every estimate
4. **Builds repeat business** — clients who got a professional experience come back for their next project

The Philippines cabinet market is mostly still running on WhatsApp quotes and Excel sheets. Joson having a proper builder intelligence system is a genuine competitive advantage.

---

## What's Already Built

✅ Phase 1 — Inventory Management (MySQL + admin UI)
✅ Phase 2 — Smart Calculator (live pricing from MySQL)
✅ Phase 3 — PDF Floor Plan Extractor (AI-powered, needs free API key)
✅ Phase 4 — Proposal Generator (branded PDF + status tracking)

⏳ Phase 5 — Admin Intelligence Dashboard (building now)
⏳ Phase 6 — Advanced (cut optimizer, 3D preview, WhatsApp chatbot)
