-- ─────────────────────────────────────────────────────────────
-- HavuzAI — Çok-kiracılı config motoru (Faz 0)
-- Bu SQL'i Supabase → SQL Editor'da BİR KEZ çalıştırın.
-- Mevcut clients / orders / usage_logs tablolarına dokunmaz.
-- ─────────────────────────────────────────────────────────────

-- 1) Firma konfigürasyon tablosu (client başına 1 satır)
CREATE TABLE IF NOT EXISTS client_configs (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id      text UNIQUE REFERENCES clients(id) ON DELETE CASCADE,
  pool_models    jsonb NOT NULL DEFAULT '[]',
  deck_colors    jsonb NOT NULL DEFAULT '[]',
  ceramic_colors jsonb NOT NULL DEFAULT '[]',
  features       jsonb NOT NULL DEFAULT '{}',
  brand          jsonb NOT NULL DEFAULT '{}',
  contact        jsonb NOT NULL DEFAULT '{}',
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

-- 2) Referans/logo görselleri için PUBLIC storage bucket
--    (Müşteri fotoğrafları mevcut "photos" bucket'ında kalır.)
--    Not: Bucket'ı Supabase → Storage arayüzünden "assets" adıyla, "Public bucket"
--    işaretli oluşturmak en güvenlisidir. Alternatif olarak SQL ile:
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ─────────────────────────────────────────────────────────────
-- SEED: mevcut firma(lar) için varsayılan katalog
-- ─────────────────────────────────────────────────────────────
-- Referans görsel URL'leri env'deki değerlerle dolduruldu (kopyala-yapıştır'a hazır).
-- Farklı bir firma için client_id'yi değiştirin.

INSERT INTO client_configs (client_id, pool_models, deck_colors, ceramic_colors, features, brand, contact)
VALUES (
  'havuzyaptir',
  '[
    {
      "id": "RELAX",
      "name": "RELAX",
      "sub": "Organik & Aile",
      "description": "dikdörtgen yapısıyla işlevsel ve sade bir tasarım sunan, her bahçeye kolaylıkla uyum sağlayan havuz modelidir.",
      "prompt_description": "STRICTLY RECTANGULAR fiberglass pool. Perfectly straight parallel long sides. Sharp 90-degree corners (very slightly softened radius only). Clean boxy rectangular silhouette from above. Horizontal ribbing texture on interior walls. DO NOT make it oval. DO NOT curve the sides. MUST be rectangular. THIS IS A RECTANGLE. NOT OVAL. NOT ROUND. NOT CURVED.",
      "tag": "En Popüler",
      "reference_image_url": "https://nmlchqrzyiqylkgvhwac.supabase.co/storage/v1/object/public/assets/pools/pool-relax.png",
      "sizes": ["2.25x4.45x1.5", "3x5x1.5", "3x6x1.5", "3x7x1.5", "3x8x1.5"]
    },
    {
      "id": "ROMA",
      "name": "ROMA",
      "sub": "Klasik & Prestij",
      "description": "Yumuşak oval hatlarıyla doğal ve şık görünüm. Modern bahcelere mükemmel uyum sağlanması.",
      "prompt_description": "Fiberglass pool shaped like a ROUNDED RECTANGLE. Two long sides straight and parallel. Two short ends are large semicircles, fully rounded. Width about half the length. Smooth transitions. NOT eye-shaped, NOT pointed ends, NOT kidney. Horizontal ribbing texture. Integrated wide entry steps at one short end, part of the pool shell, descending into the water.",
      "tag": "Premium",
      "reference_image_url": "https://nmlchqrzyiqylkgvhwac.supabase.co/storage/v1/object/public/assets/pools/pool-roma.jpg",
      "sizes": ["3x6x1.5"]
    }
  ]'::jsonb,
  '[
    {"id": "ceviz", "name": "Ceviz", "hex": "#8B6347"},
    {"id": "antrasit04", "name": "Antrasit 04", "hex": "#4A4A4A"},
    {"id": "koyu-kahve", "name": "Koyu Kahve", "hex": "#3D2B1F"},
    {"id": "yesil", "name": "Yeşil", "hex": "#5C7A3E"},
    {"id": "kirmizi", "name": "Kırmızı", "hex": "#8B3A3A"},
    {"id": "gunes-sarisi", "name": "Güneş Sarısı", "hex": "#C8A45A"},
    {"id": "bej", "name": "Bej", "hex": "#C4A882"}
  ]'::jsonb,
  '[
    {"id": "turkuaz", "name": "Turkuaz", "hex": "linear-gradient(135deg, #0EA5E9, #06B6D4)"},
    {"id": "mavi", "name": "Mavi", "hex": "linear-gradient(135deg, #3B82F6, #1D4ED8)"},
    {"id": "beyaz", "name": "Beyaz", "hex": "linear-gradient(135deg, #E0F2FE, #BAE6FD)"},
    {"id": "gri", "name": "Gri", "hex": "linear-gradient(135deg, #94A3B8, #64748B)"},
    {"id": "krem", "name": "Krem", "hex": "linear-gradient(135deg, #FEF3C7, #D4A853)"}
  ]'::jsonb,
  '{"waterfall": true, "stairs": true}'::jsonb,
  '{"primary_color": "#1D7BBF"}'::jsonb,
  '{}'::jsonb
)
ON CONFLICT (client_id) DO NOTHING;
