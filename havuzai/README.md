# HavuzAI — Havuz Görselleştirme SaaS

Müşterilerin kendi bahçe fotoğrafına yapay zeka ile prefabrik havuz ekleyebildiği, birden fazla havuzcu firmasına white-label olarak sunulan SaaS uygulaması.

## Nasıl Çalışır

1. Müşteri `/app?client=firmaId` adresine girer
2. 5 adımlı form doldurur (fotoğraf, model, ölçü, çevre, iletişim)
3. fal.ai / Flux-Pro modeli AI görsel üretir (~15 sn)
4. Sipariş Supabase'e kaydedilir, firmaya e-posta gider
5. Firma `/admin/firmaId` adresinden siparişleri yönetir

## Sayfalar

| URL | Açıklama |
|-----|----------|
| `/app?client=firmaId` | Müşteri formu |
| `/embed?client=firmaId` | iframe embed versiyonu |
| `/result/[orderId]` | Sipariş sonuç sayfası |
| `/admin/[clientId]` | Firma admin paneli |
| `/super-admin` | Tüm firmaları yönet (şifre korumalı) |
| `/logs?secret=ADMIN_SECRET` | Sistem log paneli |

## Kurulum

```bash
git clone https://github.com/KAYACI0/havuz-ai-web-app-automation.git
cd havuz-ai-web-app-automation
npm install

cp .env.example .env.local
# .env.local dosyasını gerçek değerlerle doldurun

npm run dev
```

## Ortam Değişkenleri

`.env.example` dosyasındaki tüm değişkenleri `.env.local`'e kopyalayıp doldurun.

| Değişken | Açıklama |
|----------|----------|
| `SUPABASE_URL` | Supabase proje URL'si |
| `SUPABASE_ANON_KEY` | Supabase anonim anahtar |
| `SUPABASE_SERVICE_KEY` | Supabase service role anahtarı |
| `FAL_KEY` | fal.ai API anahtarı |
| `RESEND_API_KEY` | Resend e-posta API anahtarı |
| `NEXT_PUBLIC_APP_URL` | Deploy edilen uygulama URL'si |
| `ADMIN_SECRET` | Log ve debug API koruma anahtarı |
| `SUPER_ADMIN_PASSWORD` | /super-admin sayfası şifresi |

## Supabase Şema

```sql
-- Firmalar
CREATE TABLE clients (
  id            text PRIMARY KEY,
  name          text NOT NULL,
  email         text NOT NULL,
  phone         text,
  plan          text DEFAULT 'basic',
  monthly_fee   numeric DEFAULT 0,
  is_active     boolean DEFAULT true,
  password_hash text,
  created_at    timestamptz DEFAULT now(),
  last_login    timestamptz
);

-- Siparişler
CREATE TABLE orders (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        text REFERENCES clients(id),
  customer_name    text,
  customer_phone   text,
  customer_address text,
  customer_city    text,
  pool_model       text,
  pool_size        text,
  deck_type        text,
  ceramic_type     text,
  original_photo   text,
  ai_photo         text,
  status           text DEFAULT 'new',
  admin_notes      text,
  source           text DEFAULT 'direct',
  created_at       timestamptz DEFAULT now()
);

-- Kullanım logları
CREATE TABLE usage_logs (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id  text,
  order_id   uuid,
  action     text,
  cost_usd   numeric,
  created_at timestamptz DEFAULT now()
);
```

## Vercel Deploy

1. Vercel dashboard'dan bu GitHub reposunu import edin
2. Tüm env değişkenlerini **Settings → Environment Variables** bölümüne ekleyin
3. Deploy edin

## Teknolojiler

- **Next.js 16** (App Router)
- **Supabase** (PostgreSQL + Storage)
- **fal.ai** (Flux-Pro Kontext görsel üretimi)
- **Resend** (e-posta bildirimleri)
- **bcryptjs** (şifre hashleme)
- **Tailwind CSS v4**
