-- Run this in Supabase Dashboard → SQL Editor → New Query

CREATE TABLE products (
  id              INTEGER       PRIMARY KEY,
  name            TEXT          NOT NULL DEFAULT '',
  brand           TEXT          NOT NULL DEFAULT '',
  category        TEXT          NOT NULL DEFAULT '',
  ram             TEXT          NOT NULL DEFAULT '',
  storage         TEXT          NOT NULL DEFAULT '',
  color           TEXT          NOT NULL DEFAULT '',
  price           INTEGER       NOT NULL DEFAULT 0,
  original_price  INTEGER       NOT NULL DEFAULT 0,
  badge           TEXT          NOT NULL DEFAULT '',
  in_stock        BOOLEAN       NOT NULL DEFAULT TRUE,
  image           TEXT          NOT NULL DEFAULT '',
  description     TEXT          NOT NULL DEFAULT '',
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Indexes for common queries
CREATE INDEX idx_products_brand    ON products (brand);
CREATE INDEX idx_products_category ON products (category);
CREATE INDEX idx_products_in_stock ON products (in_stock);

-- RLS: public reads, writes only via service_role key (used in API)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read products"
  ON products FOR SELECT USING (TRUE);
