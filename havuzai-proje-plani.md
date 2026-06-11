# 🏊 havuzai.com.tr — Tam Proje Planı

> **Proje Adı:** HavuzAI  
> **Domain:** havuzai.com.tr  
> **Amaç:** Prefabrik havuz firmaları için AI destekli görselleştirme ve sipariş yönetim sistemi  
> **Versiyon:** 1.0.0  
> **Tarih:** Haziran 2025

---

## 📋 İçindekiler

1. [Proje Özeti](#1-proje-özeti)
2. [Sistem Mimarisi](#2-sistem-mimarisi)
3. [Teknoloji Stack](#3-teknoloji-stack)
4. [Veritabanı Şeması](#4-veritabanı-şeması)
5. [API Endpoint'leri](#5-api-endpointleri)
6. [Frontend Sayfalar](#6-frontend-sayfalar)
7. [Widget / Embed Script](#7-widget--embed-script)
8. [fal.ai Entegrasyonu](#8-falai-entegrasyonu)
9. [Supabase Kurulumu](#9-supabase-kurulumu)
10. [Ortam Değişkenleri](#10-ortam-değişkenleri)
11. [Dosya Yapısı](#11-dosya-yapısı)
12. [Deploy Adımları](#12-deploy-adımları)
13. [Geliştirme Takvimi](#13-geliştirme-takvimi)
14. [Maliyet Analizi](#14-maliyet-analizi)

---

## 1. Proje Özeti

### Ne Yapıyor?

HavuzAI, prefabrik havuz firmalarının websitelerine tek satır kod ile eklenebilen,
müşterilerin kendi ev/villa fotoğraflarına AI ile havuz görselleştirmesi yapmasını sağlayan SaaS sistemidir.

### İki Bileşen

```
┌─────────────────────────────────────────────────────────┐
│  1. WEB UYGULAMASI    havuzai.com.tr                    │
│     Müşteri formu + AI görsel + Sonuç ekranı            │
│                                                         │
│  2. EMBED SCRIPT      havuzai.com.tr/widget.js          │
│     Herhangi bir siteye <script> ile eklenir            │
│     Açılan modal = web uygulamasının kendisi            │
└─────────────────────────────────────────────────────────┘
```

### Tam Akış

```
Müşteri
  │
  ├─► havuzyaptir.com'daki butona basar (widget)
  │        VEYA
  └─► havuzai.com.tr'ye direkt girer
           │
           ▼
  5 Adımlı Form
  ├── Fotoğraf yükle
  ├── Havuz modeli seç (RELAX / ROMA)
  ├── Ölçü seç (3x5, 3x6.5, 4x8 ...)
  ├── Çevre seç (Deck rengi, Seramik)
  └── İletişim bilgileri
           │
           ▼
  API İşlemleri (~15 saniye)
  ├── Fotoğraf → Supabase Storage
  ├── Prompt oluştur
  ├── fal.ai Flux Kontext Pro → AI görsel üret
  ├── Sipariş → Supabase DB
  └── Admin'e e-posta bildirimi
           │
           ▼
  Müşteri → Önce/Sonra görsel görür
  Admin   → Admin panelde yeni sipariş görür
```

---

## 2. Sistem Mimarisi

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT TARAF                          │
│                                                              │
│  havuzyaptir.com          havuzai.com.tr                     │
│  ┌─────────────┐          ┌─────────────────────────────┐   │
│  │ Normal Site │          │   Next.js Web Uygulaması    │   │
│  │             │          │   ├── /app (müşteri formu)  │   │
│  │ <script     │──iframe──│   ├── /admin (yönetim)      │   │
│  │  widget.js> │          │   └── /embed (iframe mode)  │   │
│  └─────────────┘          └──────────────┬──────────────┘   │
└─────────────────────────────────────────┼────────────────────┘
                                          │ API Calls
┌─────────────────────────────────────────▼────────────────────┐
│                        SERVER TARAF                          │
│                                                              │
│  Next.js API Routes (Vercel)                                 │
│  ├── POST /api/generate    → AI görsel üret                  │
│  ├── POST /api/orders      → Sipariş kaydet                  │
│  ├── GET  /api/orders      → Siparişleri getir               │
│  └── POST /api/notify      → Bildirim gönder                 │
│                                                              │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐ │
│  │  Supabase   │    │   fal.ai     │    │   Resend        │ │
│  │  ├── DB     │    │   Flux       │    │   (E-posta      │ │
│  │  └── Storage│    │   Kontext Pro│    │    bildirimi)   │ │
│  └─────────────┘    └──────────────┘    └─────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Teknoloji Stack

| Katman | Teknoloji | Versiyon | Kullanım Amacı |
|--------|-----------|----------|----------------|
| Framework | Next.js | 15.x | Web app + API |
| Dil | TypeScript | 5.x | Tip güvenliği |
| Stil | Tailwind CSS | 3.x | UI tasarımı |
| Veritabanı | Supabase PostgreSQL | Latest | Sipariş verisi |
| Dosya Depolama | Supabase Storage | Latest | Fotoğraf depolama |
| AI Görsel | fal.ai Flux Kontext Pro | Latest | Havuz görselleştirme |
| E-posta | Resend | Latest | Admin bildirimleri |
| Hosting | Vercel | Latest | Deploy |
| Domain | havuzai.com.tr | — | .com.tr uzantısı |

### Paket Kurulumu

```bash
npx create-next-app@latest havuzai --typescript --tailwind --app
cd havuzai

npm install @fal-ai/client
npm install @supabase/supabase-js
npm install resend
npm install react-dropzone
npm install react-hot-toast
npm install lucide-react
```

---

## 4. Veritabanı Şeması

### Supabase'de Çalıştırılacak SQL

```sql
-- =============================================
-- TABLO 1: clients (firmalar)
-- =============================================
CREATE TABLE clients (
  id            TEXT PRIMARY KEY,         -- 'havuzyaptir'
  name          TEXT NOT NULL,            -- 'Havuz Yaptır'
  email         TEXT NOT NULL,            -- admin e-posta
  phone         TEXT,
  plan          TEXT DEFAULT 'basic',     -- basic / pro
  monthly_fee   INTEGER DEFAULT 2500,     -- aylık ücret (TL)
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLO 2: orders (siparişler)
-- =============================================
CREATE TABLE orders (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id         TEXT REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Müşteri bilgileri
  customer_name     TEXT NOT NULL,
  customer_phone    TEXT NOT NULL,
  customer_address  TEXT NOT NULL,
  customer_city     TEXT,

  -- Havuz seçimleri
  pool_model        TEXT NOT NULL,        -- 'RELAX' | 'ROMA'
  pool_size         TEXT NOT NULL,        -- '3x6.5'
  deck_type         TEXT,                 -- 'kahve' | 'gri' | 'bej'
  ceramic_type      TEXT,                 -- seramik rengi

  -- Fotoğraflar
  original_photo    TEXT NOT NULL,        -- Supabase Storage URL
  ai_photo          TEXT,                 -- fal.ai üretilen görsel URL
  
  -- Durum
  status            TEXT DEFAULT 'new',   -- new | contacted | offered | completed | cancelled
  admin_notes       TEXT,
  
  -- Meta
  source            TEXT DEFAULT 'widget', -- 'widget' | 'direct'
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLO 3: usage_logs (kullanım takibi)
-- =============================================
CREATE TABLE usage_logs (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id     TEXT REFERENCES clients(id),
  order_id      UUID REFERENCES orders(id),
  action        TEXT,                     -- 'image_generated' | 'order_created'
  cost_usd      DECIMAL(10,4),           -- fal.ai maliyeti
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEX'LER (hız için)
-- =============================================
CREATE INDEX idx_orders_client_id ON orders(client_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_usage_client_id ON usage_logs(client_id);

-- =============================================
-- OTOMATİK updated_at GÜNCELLEMESİ
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- TEST VERİSİ — İlk firma
-- =============================================
INSERT INTO clients (id, name, email, phone)
VALUES ('havuzyaptir', 'Havuz Yaptır', 'admin@havuzyaptir.com', '05001234567');
```

### Supabase Storage Bucket

```sql
-- Storage bucket oluştur
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true);

-- Public okuma izni
CREATE POLICY "Public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'photos');

-- Authenticated upload izni
CREATE POLICY "Authenticated upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'photos');
```

---

## 5. API Endpoint'leri

### POST `/api/generate`
Fotoğraf alır, AI görsel üretir, siparişi kaydeder.

```typescript
// app/api/generate/route.ts

import * as fal from "@fal-ai/client";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

fal.config({ credentials: process.env.FAL_KEY });

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const clientId     = formData.get("clientId") as string;
    const photo        = formData.get("photo") as File;
    const poolModel    = formData.get("poolModel") as string;
    const poolSize     = formData.get("poolSize") as string;
    const deckType     = formData.get("deckType") as string;
    const ceramicType  = formData.get("ceramicType") as string;
    const customerName = formData.get("customerName") as string;
    const customerPhone= formData.get("customerPhone") as string;
    const customerAddr = formData.get("customerAddress") as string;
    const source       = formData.get("source") as string || "direct";

    // 1. Fotoğrafı Supabase Storage'a yükle
    const fileName = `${clientId}/${Date.now()}-original.jpg`;
    const photoBuffer = await photo.arrayBuffer();

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("photos")
      .upload(fileName, photoBuffer, { contentType: "image/jpeg" });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("photos")
      .getPublicUrl(fileName);

    const originalPhotoUrl = urlData.publicUrl;

    // 2. AI Prompt oluştur
    const prompt = buildPrompt(poolModel, poolSize, deckType, ceramicType);

    // 3. fal.ai ile görsel üret
    const result = await fal.subscribe("fal-ai/flux-kontext/pro", {
      input: {
        prompt,
        image_url: originalPhotoUrl,
      },
    });

    const aiPhotoUrl = result.images[0].url;

    // 4. Siparişi veritabanına kaydet
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        client_id:        clientId,
        customer_name:    customerName,
        customer_phone:   customerPhone,
        customer_address: customerAddr,
        pool_model:       poolModel,
        pool_size:        poolSize,
        deck_type:        deckType,
        ceramic_type:     ceramicType,
        original_photo:   originalPhotoUrl,
        ai_photo:         aiPhotoUrl,
        source,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 5. Kullanım logu kaydet
    await supabase.from("usage_logs").insert({
      client_id: clientId,
      order_id:  order.id,
      action:    "image_generated",
      cost_usd:  0.04,
    });

    // 6. Admin'e bildirim e-postası gönder
    const { data: client } = await supabase
      .from("clients")
      .select("email, name")
      .eq("id", clientId)
      .single();

    if (client) {
      await resend.emails.send({
        from: "HavuzAI <bildirim@havuzai.com.tr>",
        to:   client.email,
        subject: "🏊 Yeni Havuz Talebi Geldi!",
        html: buildEmailTemplate(order, client.name),
      });
    }

    return Response.json({
      success:  true,
      orderId:  order.id,
      aiPhoto:  aiPhotoUrl,
      original: originalPhotoUrl,
    });

  } catch (error) {
    console.error("Generate error:", error);
    return Response.json(
      { success: false, error: "Görsel oluşturulamadı" },
      { status: 500 }
    );
  }
}

// Prompt oluşturucu
function buildPrompt(
  model: string,
  size: string,
  deck: string,
  ceramic: string
): string {
  return `
    Add a ${model} model prefabricated swimming pool (${size} meters) 
    to the garden or backyard of this house/villa. 
    ${deck ? `Surround the pool with ${deck} colored wooden deck.` : ""}
    ${ceramic ? `Pool interior with ${ceramic} ceramic tiles.` : ""}
    The pool should look completely realistic and naturally integrated 
    into the existing garden. 
    Professional photography, natural daylight, photorealistic quality.
    Do not change the house structure, only add the pool to the garden area.
  `.trim();
}

// E-posta şablonu
function buildEmailTemplate(order: any, clientName: string): string {
  return `
    <h2>🏊 Yeni Havuz Talebi — ${clientName}</h2>
    <hr/>
    <p><strong>Müşteri:</strong> ${order.customer_name}</p>
    <p><strong>Telefon:</strong> ${order.customer_phone}</p>
    <p><strong>Adres:</strong> ${order.customer_address}</p>
    <hr/>
    <p><strong>Havuz Modeli:</strong> ${order.pool_model}</p>
    <p><strong>Ölçü:</strong> ${order.pool_size}</p>
    <p><strong>Deck:</strong> ${order.deck_type || "-"}</p>
    <p><strong>Seramik:</strong> ${order.ceramic_type || "-"}</p>
    <hr/>
    <p>
      <a href="https://havuzai.com.tr/admin" 
         style="background:#0066cc;color:white;padding:12px 24px;
                border-radius:6px;text-decoration:none;">
        Admin Panele Git →
      </a>
    </p>
  `;
}
```

---

### GET `/api/orders`
Admin için siparişleri getirir.

```typescript
// app/api/orders/route.ts

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");
  const status   = searchParams.get("status");
  const page     = parseInt(searchParams.get("page") || "1");
  const limit    = 20;

  let query = supabase
    .from("orders")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error, count } = await query;

  return Response.json({ orders: data, total: count });
}
```

---

### PATCH `/api/orders/[id]`
Sipariş durumunu günceller.

```typescript
// app/api/orders/[id]/route.ts

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { status, adminNotes } = await request.json();

  const { data, error } = await supabase
    .from("orders")
    .update({ status, admin_notes: adminNotes })
    .eq("id", params.id)
    .select()
    .single();

  return Response.json({ order: data });
}
```

---

## 6. Frontend Sayfalar

### Sayfa Listesi

```
app/
├── page.tsx                    → Ana sayfa (yönlendirme)
├── app/
│   └── page.tsx               → 5 adımlı müşteri formu
├── embed/
│   └── page.tsx               → iframe modu (widget için)
├── result/
│   └── [orderId]/page.tsx     → Önce/Sonra sonuç ekranı
└── admin/
    ├── page.tsx               → Admin giriş
    └── [clientId]/
        └── page.tsx           → Admin sipariş paneli
```

---

### Müşteri Formu `/app` — 5 Adım

```typescript
// app/app/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Adım bileşenleri
import StepPhoto    from "@/components/steps/StepPhoto";
import StepModel    from "@/components/steps/StepModel";
import StepSize     from "@/components/steps/StepSize";
import StepEnviron  from "@/components/steps/StepEnvironment";
import StepContact  from "@/components/steps/StepContact";
import LoadingScreen from "@/components/LoadingScreen";

export interface FormData {
  photo:           File | null;
  poolModel:       string;   // RELAX | ROMA
  poolSize:        string;   // 3x5 | 3x6.5 | 4x8 ...
  deckType:        string;
  ceramicType:     string;
  customerName:    string;
  customerPhone:   string;
  customerAddress: string;
}

export default function AppPage() {
  const router   = useRouter();
  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState<FormData>({
    photo: null, poolModel: "", poolSize: "",
    deckType: "", ceramicType: "",
    customerName: "", customerPhone: "", customerAddress: "",
  });

  const updateForm = (data: Partial<FormData>) =>
    setForm(prev => ({ ...prev, ...data }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("clientId",         "havuzyaptir");  // URL param'dan alınır
      fd.append("photo",            form.photo!);
      fd.append("poolModel",        form.poolModel);
      fd.append("poolSize",         form.poolSize);
      fd.append("deckType",         form.deckType);
      fd.append("ceramicType",      form.ceramicType);
      fd.append("customerName",     form.customerName);
      fd.append("customerPhone",    form.customerPhone);
      fd.append("customerAddress",  form.customerAddress);

      const res  = await fetch("/api/generate", { method: "POST", body: fd });
      const data = await res.json();

      if (data.success) {
        router.push(`/result/${data.orderId}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10">
      {/* Progress Bar */}
      <div className="w-full max-w-lg mb-8">
        <div className="flex justify-between mb-2">
          {[1,2,3,4,5].map(n => (
            <div
              key={n}
              className={`w-10 h-10 rounded-full flex items-center justify-center
                font-bold text-sm
                ${step >= n
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-400"}`}
            >
              {n}
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 h-2 rounded">
          <div
            className="bg-blue-600 h-2 rounded transition-all"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Adım İçerikleri */}
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8">
        {step === 1 && <StepPhoto    form={form} update={updateForm} />}
        {step === 2 && <StepModel    form={form} update={updateForm} />}
        {step === 3 && <StepSize     form={form} update={updateForm} />}
        {step === 4 && <StepEnviron  form={form} update={updateForm} />}
        {step === 5 && <StepContact  form={form} update={updateForm} />}

        {/* Navigasyon Butonları */}
        <div className="flex justify-between mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl
                         text-gray-600 font-semibold hover:bg-gray-50"
            >
              ← Geri
            </button>
          )}
          {step < 5 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="ml-auto px-6 py-3 bg-blue-600 text-white
                         rounded-xl font-semibold hover:bg-blue-700"
            >
              İleri →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="ml-auto px-8 py-3 bg-green-600 text-white
                         rounded-xl font-bold hover:bg-green-700"
            >
              🏊 Görselimi Oluştur
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

### Yükleme Ekranı Bileşeni

```typescript
// components/LoadingScreen.tsx

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50
                    flex flex-col items-center justify-center gap-6">
      <div className="text-6xl animate-bounce">🏊</div>
      <h2 className="text-2xl font-bold text-blue-800">
        Görseliniz Hazırlanıyor...
      </h2>
      <p className="text-gray-500 text-center max-w-sm">
        Yapay zeka, seçtiğiniz havuzu evinize yerleştiriyor.
        Bu işlem yaklaşık 15-20 saniye sürer.
      </p>
      <div className="flex gap-2">
        {[0,1,2].map(i => (
          <div
            key={i}
            className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}
```

---

### Sonuç Ekranı `/result/[orderId]`

```typescript
// app/result/[orderId]/page.tsx

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function ResultPage({
  params
}: {
  params: { orderId: string }
}) {
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/orders/${params.orderId}`)
      .then(r => r.json())
      .then(d => setOrder(d.order));
  }, []);

  if (!order) return <div className="p-10 text-center">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Başarı Mesajı */}
      <div className="max-w-2xl mx-auto text-center mb-8">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-3xl font-bold text-gray-800">
          Görseliniz Hazır!
        </h1>
        <p className="text-gray-500 mt-2">
          Talebiniz alındı. En kısa sürede sizi arayacağız.
        </p>
      </div>

      {/* Önce / Sonra */}
      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-center font-semibold text-gray-600 mb-2">
              📷 Mevcut
            </p>
            <img
              src={order.original_photo}
              alt="Orijinal"
              className="w-full rounded-xl shadow"
            />
          </div>
          <div>
            <p className="text-center font-semibold text-blue-600 mb-2">
              🏊 AI Görsel
            </p>
            <img
              src={order.ai_photo}
              alt="AI Görsel"
              className="w-full rounded-xl shadow ring-2 ring-blue-400"
            />
          </div>
        </div>

        {/* Seçimler Özeti */}
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="font-bold text-lg mb-4">📋 Seçimleriniz</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Model:</span>
              <span className="ml-2 font-semibold">{order.pool_model}</span>
            </div>
            <div>
              <span className="text-gray-500">Ölçü:</span>
              <span className="ml-2 font-semibold">{order.pool_size}</span>
            </div>
            <div>
              <span className="text-gray-500">Deck:</span>
              <span className="ml-2 font-semibold">
                {order.deck_type || "-"}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Seramik:</span>
              <span className="ml-2 font-semibold">
                {order.ceramic_type || "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### Admin Paneli `/admin/[clientId]`

```typescript
// app/admin/[clientId]/page.tsx

"use client";

import { useEffect, useState } from "react";

const STATUS_LABELS = {
  new:       { label: "Yeni",          color: "bg-blue-100 text-blue-800" },
  contacted: { label: "Arandı",        color: "bg-yellow-100 text-yellow-800" },
  offered:   { label: "Teklif Verildi",color: "bg-purple-100 text-purple-800" },
  completed: { label: "Tamamlandı",    color: "bg-green-100 text-green-800" },
  cancelled: { label: "İptal",         color: "bg-red-100 text-red-800" },
};

export default function AdminPage({
  params
}: {
  params: { clientId: string }
}) {
  const [orders, setOrders]     = useState<any[]>([]);
  const [filter, setFilter]     = useState("all");
  const [selected, setSelected] = useState<any>(null);

  const loadOrders = async () => {
    const res  = await fetch(
      `/api/orders?clientId=${params.clientId}&status=${filter}`
    );
    const data = await res.json();
    setOrders(data.orders || []);
  };

  useEffect(() => { loadOrders(); }, [filter]);

  const updateStatus = async (orderId: string, status: string) => {
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadOrders();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm px-8 py-4 flex items-center
                         justify-between">
        <h1 className="text-2xl font-bold text-blue-700">
          🏊 HavuzAI — Admin Panel
        </h1>
        <span className="text-gray-500 text-sm">
          {params.clientId}
        </span>
      </header>

      <div className="p-8">
        {/* Filtre Butonları */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["all", "new", "contacted", "offered", "completed"].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg font-medium text-sm
                ${filter === s
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border hover:bg-gray-50"}`}
            >
              {s === "all" ? "Tümü" :
               STATUS_LABELS[s as keyof typeof STATUS_LABELS]?.label}
              {s === "new" && (
                <span className="ml-2 bg-red-500 text-white text-xs
                                 px-2 py-0.5 rounded-full">
                  {orders.filter(o => o.status === "new").length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Sipariş Listesi */}
        <div className="grid gap-4">
          {orders.map(order => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow p-6 flex gap-6
                         cursor-pointer hover:shadow-md transition"
              onClick={() => setSelected(order)}
            >
              {/* Görseller */}
              <div className="flex gap-3 shrink-0">
                <img
                  src={order.original_photo}
                  alt="Orijinal"
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex items-center text-2xl">→</div>
                <img
                  src={order.ai_photo}
                  alt="AI"
                  className="w-24 h-24 object-cover rounded-lg
                             ring-2 ring-blue-400"
                />
              </div>

              {/* Bilgiler */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg">
                      {order.customer_name}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      📞 {order.customer_phone}
                    </p>
                    <p className="text-gray-500 text-sm">
                      📍 {order.customer_address}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold
                    ${STATUS_LABELS[
                      order.status as keyof typeof STATUS_LABELS
                    ]?.color}`}>
                    {STATUS_LABELS[
                      order.status as keyof typeof STATUS_LABELS
                    ]?.label}
                  </span>
                </div>

                <div className="mt-3 flex gap-4 text-sm text-gray-600">
                  <span>🏊 {order.pool_model}</span>
                  <span>📐 {order.pool_size}</span>
                  {order.deck_type && <span>🪵 {order.deck_type}</span>}
                </div>
              </div>

              {/* Aksiyon Butonları */}
              <div className="flex flex-col gap-2 justify-center shrink-0">
                {order.status === "new" && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      updateStatus(order.id, "contacted");
                    }}
                    className="px-4 py-2 bg-yellow-500 text-white
                               rounded-lg text-sm font-semibold
                               hover:bg-yellow-600"
                  >
                    📞 Arandı
                  </button>
                )}
                {order.status === "contacted" && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      updateStatus(order.id, "offered");
                    }}
                    className="px-4 py-2 bg-purple-500 text-white
                               rounded-lg text-sm font-semibold
                               hover:bg-purple-600"
                  >
                    📄 Teklif Verildi
                  </button>
                )}
                {order.status === "offered" && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      updateStatus(order.id, "completed");
                    }}
                    className="px-4 py-2 bg-green-500 text-white
                               rounded-lg text-sm font-semibold
                               hover:bg-green-600"
                  >
                    ✅ Tamamlandı
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## 7. Widget / Embed Script

```javascript
// public/widget.js
// Bu dosya havuzai.com.tr/widget.js adresinden yüklenir
// Herhangi bir siteye tek satır ile eklenir:
// <script src="https://havuzai.com.tr/widget.js" data-client="havuzyaptir"></script>

(function () {
  "use strict";

  // Script tag'inden client ID'yi oku
  const scripts   = document.getElementsByTagName("script");
  const thisScript = scripts[scripts.length - 1];
  const clientId  = thisScript.getAttribute("data-client") || "default";

  // Stil ekle
  const style = document.createElement("style");
  style.textContent = `
    #havuzai-btn {
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: linear-gradient(135deg, #0066cc, #00aaff);
      color: white;
      border: none;
      padding: 14px 22px;
      border-radius: 50px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0,102,204,0.4);
      z-index: 9998;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    #havuzai-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 25px rgba(0,102,204,0.5);
    }
    #havuzai-overlay {
      display: none;
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.6);
      z-index: 9999;
      backdrop-filter: blur(4px);
    }
    #havuzai-modal {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 90%;
      max-width: 520px;
      height: 85vh;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 25px 60px rgba(0,0,0,0.4);
    }
    #havuzai-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    #havuzai-close {
      position: absolute;
      top: 15px;
      right: 15px;
      background: rgba(255,255,255,0.9);
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      font-size: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    }
  `;
  document.head.appendChild(style);

  // Buton oluştur
  const btn    = document.createElement("button");
  btn.id       = "havuzai-btn";
  btn.innerHTML = "🏊 Havuzunu Tasarla";

  // Overlay + Modal oluştur
  const overlay = document.createElement("div");
  overlay.id    = "havuzai-overlay";

  const modal   = document.createElement("div");
  modal.id      = "havuzai-modal";

  const iframe  = document.createElement("iframe");
  iframe.id     = "havuzai-iframe";
  iframe.src    = `https://havuzai.com.tr/embed?client=${clientId}`;
  iframe.title  = "HavuzAI";

  const closeBtn    = document.createElement("button");
  closeBtn.id       = "havuzai-close";
  closeBtn.innerHTML = "✕";

  // DOM'a ekle
  modal.appendChild(closeBtn);
  modal.appendChild(iframe);
  overlay.appendChild(modal);
  document.body.appendChild(btn);
  document.body.appendChild(overlay);

  // Olaylar
  const openModal  = () => { overlay.style.display = "block"; };
  const closeModal = () => { overlay.style.display = "none";  };

  btn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeModal();
  });

  // iframe'den gelen mesajları dinle (modal kapat)
  window.addEventListener("message", function (e) {
    if (e.data === "HAVUZAI_CLOSE") closeModal();
    if (e.data === "HAVUZAI_SUCCESS") {
      closeModal();
      // İsteğe bağlı: Teşekkür bildirimi
    }
  });
})();
```

### Embed Modu Sayfası

```typescript
// app/embed/page.tsx
// Bu sayfa widget içindeki iframe'de açılır

"use client";

import { useSearchParams } from "next/navigation";
import AppPage from "@/app/app/page"; // Aynı formu yeniden kullan

export default function EmbedPage() {
  const params   = useSearchParams();
  const clientId = params.get("client") || "default";

  // Modal kapatma mesajı gönder
  const handleClose = () => {
    window.parent.postMessage("HAVUZAI_CLOSE", "*");
  };

  return (
    <div className="relative">
      {/* Kapat butonu (iframe içinde) */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-50 bg-gray-100
                   hover:bg-gray-200 rounded-full w-8 h-8
                   flex items-center justify-center text-gray-600"
      >
        ✕
      </button>

      {/* Ana form (clientId ile) */}
      <AppPage clientId={clientId} isEmbed={true} />
    </div>
  );
}
```

---

## 8. fal.ai Entegrasyonu

### Kurulum

```bash
npm install @fal-ai/client
```

### Kullanılan Model

```
Model:   fal-ai/flux-kontext/pro
Fiyat:   $0.04 / görsel (~1.5 TL)
Süre:    10-20 saniye
Amaç:    Var olan fotoğrafa nesne ekle (img2img)
```

### Hesap Açma Adımları

```
1. https://fal.ai adresine git
2. Sign up → Google ile giriş
3. Dashboard → API Keys → New Key
4. Key'i kopyala → .env.local dosyasına ekle
5. Ödeme: "Add Payment Method" → kredi kartı ekle
   (prepaid, sadece kullandıkça öder)
```

### Test Kodu

```typescript
// scripts/test-fal.ts

import * as fal from "@fal-ai/client";

fal.config({ credentials: process.env.FAL_KEY! });

async function test() {
  console.log("fal.ai test başlıyor...");

  const result = await fal.subscribe("fal-ai/flux-kontext/pro", {
    input: {
      prompt: `Add a RELAX model prefabricated swimming pool 
               (3x6 meters) with gray wooden deck to the 
               garden of this house. Photorealistic.`,
      image_url: "https://picsum.photos/800/600",  // test fotoğrafı
    },
    logs: true,
    onQueueUpdate: (update) => {
      console.log("Durum:", update.status);
    },
  });

  console.log("✅ Başarılı!");
  console.log("Görsel URL:", result.images[0].url);
}

test();
```

---

## 9. Supabase Kurulumu

### Hesap + Proje Oluşturma

```
1. https://supabase.com → Sign up
2. New Project:
   - Name: havuzai
   - Database Password: (güçlü şifre yaz, kaydet!)
   - Region: West EU (Frankfurt) — Türkiye'ye en yakın
3. Proje oluşturulunca bekle (~2 dakika)
```

### .env Değerlerini Alma

```
Settings → API:
  ├── Project URL      → SUPABASE_URL
  ├── anon key         → SUPABASE_ANON_KEY (frontend)
  └── service_role key → SUPABASE_SERVICE_KEY (backend)
```

### SQL Editor'da Çalıştır

```
Sol menü → SQL Editor → New Query
Yukarıdaki tüm SQL'i yapıştır → Run (F5)
```

### Storage Bucket

```
Sol menü → Storage → New Bucket:
  Name:   photos
  Public: ✅ açık
```

---

## 10. Ortam Değişkenleri

```bash
# .env.local dosyası (projenin kök dizinine)

# Supabase
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...

# fal.ai
FAL_KEY=fal_sk_xxxxxxxxxxxxxxxxxxxx

# Resend (e-posta bildirimleri)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

# App
NEXT_PUBLIC_APP_URL=https://havuzai.com.tr
ADMIN_SECRET=guclu_bir_sifre_yaz
```

### Vercel'e Ortam Değişkenleri Ekleme

```
Vercel Dashboard → Projen → Settings → Environment Variables
Her değeri tek tek ekle → Save
```

---

## 11. Dosya Yapısı

```
havuzai/
├── .env.local
├── package.json
├── next.config.ts
├── tailwind.config.ts
│
├── public/
│   ├── widget.js                    ← Sitelere eklenen script
│   ├── logo.svg
│   └── pool-models/
│       ├── relax.png
│       └── roma.png
│
├── app/
│   ├── layout.tsx                   ← Root layout
│   ├── page.tsx                     ← Ana yönlendirme
│   │
│   ├── app/
│   │   └── page.tsx                 ← 5 adımlı müşteri formu
│   │
│   ├── embed/
│   │   └── page.tsx                 ← Widget iframe modu
│   │
│   ├── result/
│   │   └── [orderId]/
│   │       └── page.tsx             ← Önce/Sonra sonuç
│   │
│   ├── admin/
│   │   ├── page.tsx                 ← Admin giriş
│   │   └── [clientId]/
│   │       └── page.tsx             ← Sipariş yönetimi
│   │
│   └── api/
│       ├── generate/
│       │   └── route.ts             ← AI görsel üret
│       ├── orders/
│       │   ├── route.ts             ← Sipariş listesi
│       │   └── [id]/
│       │       └── route.ts         ← Sipariş güncelle
│       └── notify/
│           └── route.ts             ← Bildirim gönder
│
├── components/
│   ├── steps/
│   │   ├── StepPhoto.tsx
│   │   ├── StepModel.tsx
│   │   ├── StepSize.tsx
│   │   ├── StepEnvironment.tsx
│   │   └── StepContact.tsx
│   ├── LoadingScreen.tsx
│   ├── ResultView.tsx
│   └── AdminOrderCard.tsx
│
└── lib/
    ├── supabase.ts                  ← Supabase client
    ├── fal.ts                       ← fal.ai helper
    └── email.ts                     ← Resend helper
```

---

## 12. Deploy Adımları

### 1. GitHub'a Push

```bash
git init
git add .
git commit -m "ilk commit - havuzai v1.0"
git remote add origin https://github.com/kullanici/havuzai.git
git push -u origin main
```

### 2. Vercel Deploy

```bash
npm install -g vercel
vercel login
vercel --prod
```

**veya** Vercel Dashboard → Import Git Repository → havuzai

### 3. Domain Bağlama

```
Vercel → Projen → Settings → Domains
"havuzai.com.tr" ekle

Domain sağlayıcında DNS:
  A    @     76.76.21.21    (Vercel IP)
  CNAME www  cname.vercel-dns.com
```

### 4. havuzyaptir.com'a Script Ekleme

```html
<!-- havuzyaptir.com sitesinin </body> kapanmadan önce -->
<script 
  src="https://havuzai.com.tr/widget.js" 
  data-client="havuzyaptir"
  defer>
</script>
```

---

## 13. Geliştirme Takvimi

```
HAFTA 1 (Gün 1-5)
├── Gün 1: Next.js proje kurulumu, Supabase kurulumu
├── Gün 2: Veritabanı şeması, Storage bucket
├── Gün 3: fal.ai entegrasyonu + test
├── Gün 4: API endpoint'leri (/generate, /orders)
└── Gün 5: Müşteri formu Step 1-2 (fotoğraf + model)

HAFTA 2 (Gün 6-10)
├── Gün 6:  Müşteri formu Step 3-4-5 (ölçü + çevre + iletişim)
├── Gün 7:  Yükleme ekranı + Sonuç ekranı
├── Gün 8:  Admin panel (liste + kart görünüm)
├── Gün 9:  Admin durum güncelleme + e-posta bildirimi
└── Gün 10: widget.js + embed modu

HAFTA 3 (Gün 11-15)
├── Gün 11: Mobil uyumluluk testleri
├── Gün 12: Hata yönetimi + edge case'ler
├── Gün 13: Vercel deploy + domain bağlama
├── Gün 14: havuzyaptir.com'a script ekleme + test
└── Gün 15: Son düzeltmeler + teslim

TOPLAM: 3 Hafta
```

---

## 14. Maliyet Analizi

### Aylık Sabit Giderler

| Servis | Plan | Aylık Maliyet |
|--------|------|---------------|
| Vercel | Hobby (ücretsiz) | 0 TL |
| Supabase | Free tier | 0 TL |
| Resend | Free (100/gün) | 0 TL |
| havuzai.com.tr | (yıllık ~300 TL) | ~25 TL |
| **Toplam Sabit** | | **~25 TL** |

### Değişken Gider (Sipariş Başına)

| İşlem | Birim Maliyet | TL Karşılığı |
|-------|---------------|--------------|
| fal.ai Flux Kontext Pro | $0.04 / görsel | ~1.5 TL |
| Supabase Storage | ~$0.001 / MB | ~0.04 TL |
| **Toplam / Sipariş** | | **~1.55 TL** |

### Aylık Senaryo

| Sipariş/Ay | fal.ai | Hosting | **Toplam Gider** |
|:----------:|:------:|:-------:|:----------------:|
| 20 | 30 TL | 25 TL | **55 TL** |
| 50 | 75 TL | 25 TL | **100 TL** |
| 100 | 150 TL | 25 TL | **175 TL** |

### Özet

```
Kurulum ücreti (tek seferlik):   6.000 TL
Aylık kira:                      2.500 TL
Aylık gider (50 sipariş):          100 TL
─────────────────────────────────────────
Aylık net kar:                  ~2.400 TL
6 aylık toplam:                ~20.400 TL
```

---

## ✅ Başlamak İçin Kontrol Listesi

```
□ havuzai.com.tr domaini satın alındı
□ Vercel hesabı açıldı
□ Supabase hesabı açıldı + proje oluşturuldu
□ fal.ai hesabı açıldı + ödeme yöntemi eklendi
□ Resend hesabı açıldı (e-posta bildirimi)
□ GitHub repo oluşturuldu
□ .env.local dosyası dolduruldu
□ SQL şeması Supabase'de çalıştırıldı
□ Storage bucket oluşturuldu
□ npm install çalıştırıldı
□ npm run dev → localhost:3000 açıldı ✅
```

---

*havuzai.com.tr — HavuzAI v1.0 Proje Planı*  
*Son güncelleme: Haziran 2025*
