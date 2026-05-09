-- ============================================================
-- Joson Furniture — Builder Intelligence System
-- Supabase Schema v1.0
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────
-- SUPPLIERS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.suppliers (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT        NOT NULL,
  contact_person TEXT,
  phone       TEXT,
  email       TEXT,
  address     TEXT,
  notes       TEXT,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────
-- MATERIALS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.materials (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT        NOT NULL,
  category         TEXT        NOT NULL, -- 'sheet_goods' | 'hardware' | 'finish' | 'labor' | 'accessory'
  subcategory      TEXT,
  -- Unit management
  unit             TEXT        NOT NULL, -- 'sheet' | 'piece' | 'set' | 'lm' | 'sqm' | 'box'
  unit_size_sqft   NUMERIC,   -- e.g. 32 for a 4x8 sheet (32 sqft); null if not a sheet
  unit_size_sqm    NUMERIC,   -- metric equivalent: 2.98 sqm
  -- Pricing (PHP)
  cost_price       NUMERIC     NOT NULL DEFAULT 0,
  sell_price       NUMERIC     NOT NULL DEFAULT 0,
  -- Relationship
  supplier_id      UUID        REFERENCES public.suppliers(id) ON DELETE SET NULL,
  supplier_sku     TEXT,
  -- Stock
  in_stock         BOOLEAN     NOT NULL DEFAULT true,
  stock_qty        NUMERIC     DEFAULT 0,
  min_stock_level  NUMERIC     DEFAULT 0,
  lead_time_days   INTEGER     DEFAULT 0,
  -- Metadata
  notes            TEXT,
  is_active        BOOLEAN     NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT materials_category_check CHECK (category IN ('sheet_goods', 'hardware', 'finish', 'labor', 'accessory')),
  CONSTRAINT materials_unit_check CHECK (unit IN ('sheet', 'piece', 'set', 'lm', 'sqm', 'box', 'pair', 'meter', 'sqft')),
  CONSTRAINT materials_prices_check CHECK (cost_price >= 0 AND sell_price >= 0)
);

-- ──────────────────────────────────────────────
-- PRICE HISTORY
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.material_price_history (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id UUID        NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  old_price   NUMERIC,
  new_price   NUMERIC     NOT NULL,
  price_type  TEXT        NOT NULL DEFAULT 'sell_price', -- 'sell_price' | 'cost_price'
  changed_by  TEXT,       -- 'admin' | 'bulk_update' | 'import'
  changed_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────
-- CABINET PRICING CONFIG (lives here, not JSON)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cabinet_pricing_config (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  key         TEXT        NOT NULL UNIQUE,
  value       JSONB       NOT NULL DEFAULT '{}',
  description TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default cabinet pricing config
INSERT INTO public.cabinet_pricing_config (key, value, description) VALUES
(
  'base_rates',
  '{"base": 40476.4, "hanging": 38452.58, "tall": 65182.2}',
  'Sheet rate per linear meter per cabinet category (without fees, PHP)'
),
(
  'fee_inclusive_rates',
  '{"base": 51097.4, "hanging": 48542.53, "tall": 82286.1}',
  'Sheet rate per linear meter per cabinet category (with fees, PHP)'
),
(
  'tier_multipliers',
  '{"luxury": 1.0, "premium": 0.9, "standard": 0.8}',
  'Price multiplier per quality tier'
),
(
  'cabinet_type_multipliers',
  '{"luxury": 1.0, "premium": 0.9, "basic": 0.8}',
  'Price multiplier per cabinet type'
),
(
  'material_multipliers',
  '{"melamine": 1.0, "laminate": 1.2, "plywood": 1.6, "solid_wood": 2.2}',
  'Material price multipliers relative to melamine baseline'
),
(
  'finish_multipliers',
  '{"standard": 1.0, "painted": 1.25, "stained": 1.35, "lacquer": 1.55}',
  'Finish price multipliers'
),
(
  'hardware_multipliers',
  '{"basic": 1.0, "soft_close": 1.2, "premium": 1.5}',
  'Hardware price multipliers'
),
(
  'installation_rate',
  '0.30',
  'Installation cost as fraction of cabinet base price (30%)'
),
(
  'tax_rate',
  '0.12',
  'VAT rate (12%)'
),
(
  'project_type_multipliers',
  '{"kitchen": 1.0, "bathroom": 0.8, "bedroom": 0.9, "office": 0.7}',
  'Project type price multipliers'
)
ON CONFLICT (key) DO NOTHING;

-- ──────────────────────────────────────────────
-- ESTIMATES / PROJECTS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.estimates (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_no      TEXT        NOT NULL UNIQUE,
  client_name        TEXT,
  client_email       TEXT,
  client_phone       TEXT,
  project_type       TEXT,
  status             TEXT        NOT NULL DEFAULT 'draft', -- 'draft' | 'sent' | 'approved' | 'rejected' | 'project'
  total_amount       NUMERIC,
  subtotal           NUMERIC,
  tax_amount         NUMERIC,
  discount_amount    NUMERIC,
  notes              TEXT,
  valid_until        TIMESTAMPTZ,
  estimate_data     JSONB,      -- full calculator state snapshot
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT estimates_status_check CHECK (status IN ('draft', 'sent', 'approved', 'rejected', 'project'))
);

-- ──────────────────────────────────────────────
-- FLOOR PLAN ANALYSES
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.floor_plan_analyses (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  estimate_id     UUID        REFERENCES public.estimates(id) ON DELETE SET NULL,
  file_name       TEXT,
  file_url        TEXT,
  ai_raw_response JSONB,      -- raw Claude/Gemini response
  parsed_rooms    JSONB,     -- extracted rooms with dimensions
  confidence      NUMERIC,    -- 0-1 confidence score
  status          TEXT        NOT NULL DEFAULT 'pending', -- 'pending' | 'processing' | 'completed' | 'failed'
  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────
-- INDEXES
-- ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_materials_category   ON public.materials(category);
CREATE INDEX IF NOT EXISTS idx_materials_active    ON public.materials(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_materials_supplier   ON public.materials(supplier_id);
CREATE INDEX IF NOT EXISTS idx_price_history_mat    ON public.material_price_history(material_id);
CREATE INDEX IF NOT EXISTS idx_estimates_status     ON public.estimates(status);
CREATE INDEX IF NOT EXISTS idx_estimates_created    ON public.estimates(created_at DESC);

-- ──────────────────────────────────────────────
-- UPDATED_AT TRIGGER
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER suppliers_updated_at      BEFORE UPDATE ON public.suppliers         FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER materials_updated_at      BEFORE UPDATE ON public.materials         FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER estimates_updated_at       BEFORE UPDATE ON public.estimates         FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER pricing_config_updated_at BEFORE UPDATE ON public.cabinet_pricing_config FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ──────────────────────────────────────────────
-- PRICE HISTORY AUTO-TRIGGER
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.track_price_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.sell_price IS DISTINCT FROM NEW.sell_price THEN
    INSERT INTO public.material_price_history (material_id, old_price, new_price, price_type, changed_by)
    VALUES (NEW.id, OLD.sell_price, NEW.sell_price, 'sell_price', 'admin');
  END IF;
  IF OLD.cost_price IS DISTINCT FROM NEW.cost_price THEN
    INSERT INTO public.material_price_history (material_id, old_price, new_price, price_type, changed_by)
    VALUES (NEW.id, OLD.cost_price, NEW.cost_price, 'cost_price', 'admin');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER materials_price_trigger
  AFTER UPDATE ON public.materials
  FOR EACH ROW EXECUTE FUNCTION public.track_price_change();

-- ──────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ──────────────────────────────────────────────
ALTER TABLE public.suppliers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cabinet_pricing_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimates           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.floor_plan_analyses ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (admin-only app — add auth policies as needed)
CREATE POLICY "Allow all on suppliers"          ON public.suppliers          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on materials"          ON public.materials          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on price history"     ON public.material_price_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on pricing config"     ON public.cabinet_pricing_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on estimates"          ON public.estimates          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on floor plan analyses" ON public.floor_plan_analyses FOR ALL USING (true) WITH CHECK (true);
