-- Joson Furniture — Builder Intelligence System
-- MySQL Schema v1.0
-- Run: mysql -u root -p joson_inventory < docs/mysql-schema.sql

CREATE DATABASE IF NOT EXISTS joson_inventory;
USE joson_inventory;

-- ──────────────────────────────────────────────
-- SUPPLIERS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS suppliers (
  id              CHAR(36) PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  contact_person  VARCHAR(255) DEFAULT NULL,
  phone           VARCHAR(50) DEFAULT NULL,
  email           VARCHAR(255) DEFAULT NULL,
  address         TEXT DEFAULT NULL,
  notes           TEXT DEFAULT NULL,
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────
-- MATERIALS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS materials (
  id               CHAR(36) PRIMARY KEY,
  name             VARCHAR(255) NOT NULL,
  category         ENUM('sheet_goods','hardware','finish','labor','accessory') NOT NULL,
  subcategory      VARCHAR(100) DEFAULT NULL,
  unit             ENUM('sheet','piece','set','pair','box','meter','sqft','sqm') NOT NULL DEFAULT 'piece',
  unit_size_sqft   DECIMAL(10,4) DEFAULT NULL COMMENT 'e.g. 32 for a 4x8 sheet',
  unit_size_sqm    DECIMAL(10,4) DEFAULT NULL,
  cost_price       DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  sell_price       DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  supplier_id      CHAR(36) DEFAULT NULL,
  supplier_sku     VARCHAR(100) DEFAULT NULL,
  in_stock         TINYINT(1) NOT NULL DEFAULT 1,
  stock_qty        DECIMAL(12,3) DEFAULT 0,
  min_stock_level  DECIMAL(12,3) DEFAULT 0,
  lead_time_days   INT DEFAULT 0,
  notes            TEXT DEFAULT NULL,
  is_active        TINYINT(1) NOT NULL DEFAULT 1,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
  INDEX idx_category   (category),
  INDEX idx_supplier   (supplier_id),
  INDEX idx_active     (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────
-- PRICE HISTORY
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS material_price_history (
  id          CHAR(36) PRIMARY KEY,
  material_id CHAR(36) NOT NULL,
  old_price   DECIMAL(12,2) DEFAULT NULL,
  new_price   DECIMAL(12,2) NOT NULL,
  price_type  ENUM('sell_price','cost_price') NOT NULL DEFAULT 'sell_price',
  changed_by  VARCHAR(100) DEFAULT NULL,
  changed_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE,
  INDEX idx_material_changed (material_id, changed_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────
-- CABINET PRICING CONFIG
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cabinet_pricing_config (
  id          CHAR(36) PRIMARY KEY,
  key_name    VARCHAR(100) NOT NULL UNIQUE,
  config_json JSON NOT NULL,
  description TEXT DEFAULT NULL,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default cabinet pricing config
INSERT INTO cabinet_pricing_config (id, key_name, config_json, description) VALUES
  (UUID(), 'base_rates',            '{"base": 40476.4, "hanging": 38452.58, "tall": 65182.2}',               'Sheet rate per linear meter per cabinet category (without fees, PHP)'),
  (UUID(), 'fee_inclusive_rates',   '{"base": 51097.4, "hanging": 48542.53, "tall": 82286.1}',              'Sheet rate per linear meter per cabinet category (with fees, PHP)'),
  (UUID(), 'tier_multipliers',       '{"luxury": 1.0, "premium": 0.9, "standard": 0.8}',                   'Price multiplier per quality tier'),
  (UUID(), 'cabinet_type_multipliers','{"luxury": 1.0, "premium": 0.9, "basic": 0.8}',                   'Price multiplier per cabinet type'),
  (UUID(), 'material_multipliers',   '{"melamine": 1.0, "laminate": 1.2, "plywood": 1.6, "solid_wood": 2.2}','Material price multipliers relative to melamine baseline'),
  (UUID(), 'finish_multipliers',     '{"standard": 1.0, "painted": 1.25, "stained": 1.35, "lacquer": 1.55}','Finish price multipliers'),
  (UUID(), 'hardware_multipliers',   '{"basic": 1.0, "soft_close": 1.2, "premium": 1.5}',                  'Hardware price multipliers'),
  (UUID(), 'installation_rate',       '0.30',                                                                'Installation cost as fraction of cabinet base price (30%)'),
  (UUID(), 'tax_rate',               '0.12',                                                                'VAT rate (12%)'),
  (UUID(), 'project_type_multipliers','{"kitchen": 1.0, "bathroom": 0.8, "bedroom": 0.9, "office": 0.7}',   'Project type price multipliers')
ON DUPLICATE KEY UPDATE key_name=key_name;

-- ──────────────────────────────────────────────
-- ESTIMATES
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS estimates (
  id              CHAR(36) PRIMARY KEY,
  reference_no    VARCHAR(50) NOT NULL UNIQUE,
  client_name     VARCHAR(255) DEFAULT NULL,
  client_email    VARCHAR(255) DEFAULT NULL,
  client_phone    VARCHAR(50) DEFAULT NULL,
  project_type    VARCHAR(50) DEFAULT NULL,
  status          ENUM('draft','sent','approved','rejected','project') NOT NULL DEFAULT 'draft',
  total_amount    DECIMAL(14,2) DEFAULT NULL,
  subtotal        DECIMAL(14,2) DEFAULT NULL,
  tax_amount      DECIMAL(14,2) DEFAULT NULL,
  discount_amount DECIMAL(14,2) DEFAULT 0,
  notes           TEXT DEFAULT NULL,
  valid_until     DATETIME DEFAULT NULL,
  estimate_data   JSON DEFAULT NULL COMMENT 'Full calculator state snapshot',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status    (status),
  INDEX idx_created   (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────
-- FLOOR PLAN ANALYSES
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS floor_plan_analyses (
  id              CHAR(36) PRIMARY KEY,
  estimate_id     CHAR(36) DEFAULT NULL,
  file_name       VARCHAR(255) DEFAULT NULL,
  file_path       VARCHAR(500) DEFAULT NULL,
  ai_raw_response JSON DEFAULT NULL,
  parsed_rooms    JSON DEFAULT NULL,
  confidence      DECIMAL(5,4) DEFAULT NULL COMMENT '0-1 confidence score',
  status          ENUM('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
  error_message   TEXT DEFAULT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (estimate_id) REFERENCES estimates(id) ON DELETE SET NULL,
  INDEX idx_status    (status),
  INDEX idx_estimate  (estimate_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
