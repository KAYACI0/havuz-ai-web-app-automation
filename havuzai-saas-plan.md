# 🏊 HavuzAI — SaaS Dönüşüm Planı

> **Hedef:** Tek firmaya özel sistemden, her havuz firmasına satılabilir SaaS ürününe dönüşüm  
> **Tarih:** Haziran 2026  
> **Mevcut URL:** havuz-ai-web-app-automation.vercel.app

---

## 📋 Mevcut Durum vs Hedef

```
MEVCUT:                          HEDEF:
─────────────────────────────    ─────────────────────────────
Tek firma (havuzyaptir)          Sınırsız firma
Hardcoded modeller               Her firma kendi modellerini tanımlar
Hardcoded ölçüler                Her firma kendi ölçülerini tanımlar
Hardcoded renkler                Her firma kendi renklerini tanımlar
Sabit referans görseller         Her model için özel referans görsel
Manuel firma ekleme              Super admin paneli ile kolay ekleme
Tek prompt sistemi               Firmaya özel prompt konfigürasyonu
```

---

## 🏗️ Sistem Mimarisi (Hedef)

```
┌─────────────────────────────────────────────────────────────┐
│                    SAAS KATMANI                             │
│                                                             │
│  havuzai.com.tr                                             │
│  ├── Landing Page (satış sayfası)                           │
│  ├── Super Admin (siz yönetirsiniz)                         │
│  │   ├── Firma ekle/sil                                     │
│  │   ├── Firma config ayarla                                │
│  │   ├── Kullanım istatistikleri                            │
│  │   └── Fatura takibi                                      │
│  ├── Firma Admin (her firma kendi paneli)                   │
│  │   ├── Siparişleri gör                                    │
│  │   ├── Kendi modellerini yönet                            │
│  │   └── Profil/şifre güncelle                              │
│  └── Müşteri Formu (/app?client=xxx)                        │
│      ├── Firmaya özel modeller                              │
│      ├── Firmaya özel ölçüler                               │
│      └── Firmaya özel renkler                               │
│                                                             │
│  Widget: havuzai.com.tr/widget.js                           │
│  └── data-client="[firma-id]" ile her firmaya özel          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Veritabanı Şeması (Genişletilmiş)

```sql
-- ─────────────────────────────────────────
-- TABLO 1: clients (firmalar)
-- ─────────────────────────────────────────
CREATE TABLE clients (
  id              TEXT PRIMARY KEY,        -- 'havuzyaptir'
  name            TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  password_hash   TEXT,
  auth_user_id    UUID,
  plan            TEXT DEFAULT 'starter',  -- starter/pro/enterprise
  is_active       BOOLEAN DEFAULT true,
  trial_ends_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- TABLO 2: client_configs (firma konfigürasyonu)
-- ─────────────────────────────────────────
CREATE TABLE client_configs (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id       TEXT REFERENCES clients(id) ON DELETE CASCADE,

  -- Havuz modelleri
  pool_models     JSONB NOT NULL DEFAULT '[]',
  -- Örnek:
  -- [
  --   {
  --     "id": "RELAX",
  --     "name": "Relax Model",
  --     "description": "Dikdörtgen form",
  --     "reference_image_url": "https://supabase.../relax.png",
  --     "sizes": ["3x5x1.5", "3x6x1.5", "3x8x1.5"]
  --   }
  -- ]

  -- Deck renkleri
  deck_colors     JSONB NOT NULL DEFAULT '[]',
  -- Örnek:
  -- [
  --   {"id": "ceviz", "name": "Ceviz", "hex": "#8B6347"},
  --   {"id": "gri",   "name": "Gri",   "hex": "#808080"}
  -- ]

  -- Seramik renkleri
  ceramic_colors  JSONB NOT NULL DEFAULT '[]',
  -- Örnek:
  -- [
  --   {"id": "turkuaz", "name": "Turkuaz", "hex": "#00B4D8"},
  --   {"id": "mavi",    "name": "Mavi",    "hex": "#1D4ED8"}
  -- ]

  -- Ekstra özellikler (toggle)
  features        JSONB NOT NULL DEFAULT '{}',
  -- Örnek:
  -- {
  --   "waterfall": true,
  --   "stairs": true,
  --   "view_angle": false
  -- }

  -- Firma rengi/markası (form tasarımı için)
  brand           JSONB DEFAULT '{}',
  -- Örnek:
  -- {
  --   "primary_color": "#0066cc",
  --   "logo_url": "https://...",
  --   "company_name": "Havuz Yaptır"
  -- }

  -- İletişim bilgileri (sonuç sayfasında gösterilir)
  contact         JSONB DEFAULT '{}',
  -- Örnek:
  -- {
  --   "phone": "0850 XXX XX XX",
  --   "whatsapp": "905001234567",
  --   "email": "info@firma.com"
  -- }

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- TABLO 3: orders (siparişler — mevcut)
-- ─────────────────────────────────────────
-- (Mevcut tablo korunur, değişiklik yok)

-- ─────────────────────────────────────────
-- TABLO 4: usage_logs (kullanım takibi)
-- ─────────────────────────────────────────
CREATE TABLE usage_logs (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id       TEXT REFERENCES clients(id),
  order_id        UUID REFERENCES orders(id),
  action          TEXT,                    -- 'image_generated'
  model_used      TEXT,                    -- 'nano-banana-pro/edit'
  cost_usd        DECIMAL(10,4),           -- fal.ai maliyeti
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- TABLO 5: invoices (faturalar)
-- ─────────────────────────────────────────
CREATE TABLE invoices (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id       TEXT REFERENCES clients(id),
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  total_images    INTEGER DEFAULT 0,
  total_cost_tl   DECIMAL(10,2),
  status          TEXT DEFAULT 'pending',  -- pending/paid/overdue
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 📁 Dosya Yapısı (Hedef)

```
havuzai/
├── public/
│   └── widget.js                         ← Her firmaya özel (data-client)
│
├── app/
│   ├── page.tsx                          ← Landing page (satış sayfası)
│   ├── app/
│   │   └── page.tsx                      ← Müşteri formu (/app?client=xxx)
│   ├── embed/
│   │   └── page.tsx                      ← Widget iframe modu
│   ├── result/
│   │   └── [orderId]/page.tsx            ← Önce/Sonra sonuç
│   ├── admin/
│   │   ├── page.tsx                      ← Firma admin girişi
│   │   └── [clientId]/
│   │       ├── page.tsx                  ← Sipariş listesi
│   │       ├── settings/page.tsx         ← Firma ayarları
│   │       └── models/page.tsx           ← Model yönetimi (YAKINDA)
│   └── super-admin/
│       ├── page.tsx                      ← Super admin girişi
│       ├── dashboard/page.tsx            ← Genel istatistikler
│       ├── firms/page.tsx                ← Tüm firmalar listesi
│       ├── firms/[clientId]/page.tsx     ← Firma detay/düzenleme
│       └── firms/[clientId]/config/      ← Firma konfigürasyonu
│           page.tsx
│
├── components/
│   ├── steps/
│   │   ├── StepPhoto.tsx
│   │   ├── StepModel.tsx                 ← Dinamik (config'den okur)
│   │   ├── StepSize.tsx                  ← Dinamik (config'den okur)
│   │   ├── StepEnvironment.tsx           ← Dinamik (config'den okur)
│   │   └── StepContact.tsx
│   ├── admin/
│   │   ├── OrderCard.tsx
│   │   ├── StatusBadge.tsx
│   │   └── OrderFilters.tsx
│   └── super-admin/
│       ├── FirmCard.tsx
│       ├── ConfigEditor.tsx              ← Firma config düzenleme
│       ├── ModelEditor.tsx               ← Havuz modeli ekleme/düzenleme
│       └── UsageChart.tsx                ← Kullanım grafiği
│
├── lib/
│   ├── supabase.ts
│   ├── prompt.ts                         ← Firmaya özel prompt
│   └── fal.ts                            ← Firmaya özel referans görseller
│
└── app/api/
    ├── config/route.ts                   ← YENİ: Firma config getir
    ├── generate/route.ts                 ← Güncellendi: Config'den okur
    ├── orders/route.ts
    ├── orders/[id]/route.ts
    ├── auth/
    │   ├── login/route.ts
    │   ├── verify/route.ts
    │   └── logout/route.ts
    └── super-admin/
        ├── create-client/route.ts
        ├── update-config/route.ts        ← YENİ: Config güncelle
        └── stats/route.ts                ← YENİ: İstatistikler
```

---

## 🔄 Dinamik Form Sistemi

### Config API

```typescript
// app/api/config/route.ts
// Her form açılışında bu endpoint çağrılır

export async function GET(request: Request) {
  const clientId = new URL(request.url).searchParams.get("clientId");

  const { data: config } = await supabase
    .from("client_configs")
    .select("*")
    .eq("client_id", clientId)
    .single();

  return Response.json({ success: true, config });
}
```

### Form Sayfası

```typescript
// app/app/page.tsx
// Config'i yükle, bileşenlere geç

const [config, setConfig] = useState(null);

useEffect(() => {
  fetch(`/api/config?clientId=${clientId}`)
    .then(r => r.json())
    .then(d => setConfig(d.config));
}, []);

// Config yüklenince bileşenler otomatik
// firmaya özel modelleri/renkleri gösterir
```

### Dinamik StepModel

```typescript
// components/steps/StepModel.tsx
// Hardcoded değil, config'den okur

export default function StepModel({ config, form, update }) {
  const models = config.pool_models; // Supabase'den gelen dinamik liste

  return (
    <div>
      {models.map(model => (
        <button
          key={model.id}
          onClick={() => update({ poolModel: model.id })}
        >
          <img src={model.reference_image_url} alt={model.name} />
          <h3>{model.name}</h3>
          <p>{model.description}</p>
        </button>
      ))}
    </div>
  );
}
```

### Dinamik Prompt

```typescript
// lib/prompt.ts
// Config'e göre dinamik prompt üretir

export function buildPoolPrompt(config: PoolConfig, clientConfig: any): string {
  // Seçilen modelin referans görsel açıklaması
  const selectedModel = clientConfig.pool_models
    .find(m => m.id === config.model);

  // Seçilen deck renginin HEX kodu
  const selectedDeck = clientConfig.deck_colors
    .find(d => d.id === config.deckColor);

  return `
    Add a ${selectedModel.name} model swimming pool...
    Deck color: ${selectedDeck?.name} (${selectedDeck?.hex})...
  `;
}
```

---

## 🎛️ Super Admin Config Paneli

### Yeni Firma Ekleme Akışı

```
ADIM 1 — Temel Bilgiler
├── Firma adı
├── Client ID (otomatik üretilir)
├── Email
├── Telefon
└── Şifre

ADIM 2 — Havuz Modelleri
Her model için:
├── Model adı (RELAX, OLYMPIA vb.)
├── Açıklama
├── Referans görsel yükle → Supabase'e yükler
└── Ölçüler (virgülle ayır: 3x5, 3x6, 3x8)

ADIM 3 — Renkler
├── Deck renkleri (ad + HEX picker)
└── Seramik renkleri (ad + HEX picker)

ADIM 4 — Özellikler
├── Şelale: ✅/❌
├── Merdiven: ✅/❌
└── Merdiven tipi: Köşe/Geniş

ADIM 5 — Marka & İletişim
├── Firma logosu
├── Birincil renk (buton rengi)
├── Telefon numarası (sonuç sayfasında gösterilir)
└── WhatsApp numarası

→ OLUŞTUR → Otomatik:
  ✅ DB'ye kaydedilir
  ✅ Supabase Auth'ta kullanıcı oluşturulur
  ✅ Hoşgeldin maili gönderilir
  ✅ Script kodu hazırlanır
  ✅ "Kopyala → WhatsApp'a Gönder" butonu çıkar
```

---

## 🤖 Prompt Sistemi (Firmaya Özel)

### Mevcut Prompt Sorunları

```
❌ Hardcoded İngilizce açıklamalar
❌ Sadece RELAX/ROMA için yazılmış
❌ Referans görseller sabit URL
❌ Yeni model ekleyince kod değiştirmek gerekiyor
```

### Hedef Prompt Sistemi

```typescript
// lib/prompt.ts

export function buildPoolPrompt(
  orderConfig: PoolConfig,      // Müşteri seçimleri
  clientConfig: ClientConfig    // Firma konfigürasyonu
): string {

  // Seçilen modeli config'den bul
  const model = clientConfig.pool_models
    .find(m => m.id === orderConfig.model);

  // Deck rengini config'den bul
  const deck = clientConfig.deck_colors
    .find(d => d.id === orderConfig.deckColor);

  // Seramik rengini config'den bul
  const ceramic = clientConfig.ceramic_colors
    .find(c => c.id === orderConfig.ceramicColor);

  return `
REFERENCE IMAGES GUIDE:
- Image 1: Customer's property photo — EDIT THIS
- Image 2: ${model.name} pool model — USE THIS EXACT SHAPE

NON-NEGOTIABLE RULES:
1. Pool MUST be IN-GROUND, flush with ground level
2. Pool shape: ${model.description}
3. Do NOT change house, trees, sky, camera angle

POOL SPECIFICATIONS:
- Model: ${model.name}
- Size: ${orderConfig.size} meters
- Water color: ${ceramic?.name || "turquoise"} ceramic tiles
${deck ? `- Deck: ${deck.name} colored composite wood boards, thin modern planks` : ""}
${orderConfig.hasWaterfall ? `- Waterfall: Stainless steel curved blade waterfall on pool edge` : ""}

QUALITY: Real estate photography, 4K photorealistic
  `.trim();
}
```

---

## 📱 Landing Page (Satış Sayfası)

### havuzai.com.tr Ana Sayfa İçeriği

```
HERO BÖLÜMÜ:
"Müşterilerinize Havuzlarını 
 Anında Gösterin"

Alt başlık:
"Kendi evlerinin fotoğrafına 20 saniyede 
 AI ile havuz ekleyin. Satışlarınızı artırın."

CTA: "Ücretsiz Demo İsteyin" → WhatsApp

─────────────────────────────────────────

NASIL ÇALIŞIR (3 adım):
1. Müşteri fotoğraf yükler
2. Model ve özellikleri seçer
3. 20 saniyede havuzlu halini görür

─────────────────────────────────────────

DEMO:
GIF veya video: Sistemin çalışırken görüntüsü

─────────────────────────────────────────

FAYDALAR:
✅ Boşa keşif gezisi yok
✅ İkna olmayan müşteri yok
✅ Rakiplerden ayrışın
✅ Kurulum 10 dakika
✅ Teknik bilgi gerekmez

─────────────────────────────────────────

FİYATLANDIRMA:
Starter  → 2.500 TL/ay
Pro      → 4.000 TL/ay
Enterprise → Özel fiyat

─────────────────────────────────────────

REFERANSLAR:
"[Firma adı] kullanıyor"
(İlk müşteriler eklenince)

─────────────────────────────────────────

ALT BÖLÜM:
"Demo İsteyin" → WhatsApp linki
```

---

## 💰 Fiyatlandırma Modeli

### Paketler

| Paket | Fiyat | Özellikler |
|-------|-------|------------|
| **Starter** | 2.500 TL/ay | 50 görsel/ay, 2 havuz modeli, email destek |
| **Pro** | 4.000 TL/ay | 150 görsel/ay, sınırsız model, WhatsApp destek |
| **Enterprise** | 6.000+ TL/ay | Sınırsız görsel, özel marka, öncelikli destek |

### Kurulum Ücreti

```
İlk kurulum: 2.000 TL (tek seferlik)
│
├── Config panelinden firma ayarlama
├── Referans görsel yükleme
├── Script kurulumu (WordPress vb.)
└── Test ve onay
```

### Gelir Projeksiyonu

```
Ay 1:  2 firma  → 5.000 TL + 4.000 TL kurulum  = 9.000 TL
Ay 3:  5 firma  → 15.000 TL/ay
Ay 6:  10 firma → 30.000 TL/ay
Ay 12: 20 firma → 60.000 TL/ay

Maliyet (20 firma, 150 görsel/ay):
├── Hosting (Vercel Pro): 760 TL
├── Supabase Pro: 950 TL
├── fal.ai (3000 görsel): 4.500 TL
└── Toplam: ~6.210 TL/ay

Net kar (20 firma): ~54.000 TL/ay
```

---

## 🗓️ Geliştirme Takvimi

### Faz 1 — Kritik Buglar (Bu Hafta)
```
□ Supabase assets bucket public yap
□ Referans görsel URL'lerini düzelt
□ nano-banana-pro/edit çalışır hale getir
□ Görsel üretimi test et (RELAX + ROMA)
□ Widget sorunu düzelt
```

### Faz 2 — Multi-tenant Altyapı (Hafta 2)
```
□ client_configs tablosunu oluştur
□ /api/config endpoint yaz
□ havuzyaptir için config verisi gir
□ StepModel → dinamik hale getir
□ StepSize → dinamik hale getir
□ StepEnvironment → dinamik hale getir
□ Prompt → config'den okur hale getir
□ Test et
```

### Faz 3 — Super Admin Config Paneli (Hafta 3)
```
□ Firma config düzenleme sayfası
□ Havuz modeli ekleme/silme
□ Referans görsel yükleme (Supabase'e)
□ Deck/seramik renk yönetimi
□ Marka ayarları (renk, logo)
□ İletişim bilgileri
```

### Faz 4 — Çoklu Görsel (Hafta 4)
```
□ 2 görsel üret, müşteri seçsin
□ "Yeniden Dene" butonu
□ Görsel kalite kontrolü
```

### Faz 5 — Landing Page + Satış (Hafta 5)
```
□ havuzai.com.tr landing page
□ Demo video çek
□ Fiyatlandırma sayfası
□ İlk 5 firmaya WhatsApp at
□ Demo ver, müşteri kapat
```

### Faz 6 — İstatistik + Fatura (Hafta 6)
```
□ Kullanım istatistikleri (super admin)
□ Aylık görsel sayısı
□ Firma bazlı maliyet takibi
□ Aylık rapor emaili
```

---

## 🎯 Satış Stratejisi

### Hedef Müşteriler

```
Öncelikli:
├── Prefabrik/fiberglass havuz firmaları
├── Peyzaj ve bahçe firmaları
└── Havuz malzemeleri satıcıları

İkincil:
├── Gayrimenkul firmaları
├── Villa/konut projeleri
└── Otel/resort
```

### Müşteri Bulma

```
1. Google'da ara:
   "prefabrik havuz [şehir]"
   "fiberglass havuz firması"
   "havuz yapım firması"

2. Instagram'da ara:
   #prefabrikhavuz
   #fiberglasskavuz
   → Yorum yapan firmalara DM at

3. Sahibinden/Yemeksepeti mantığı:
   → Google Maps'te "havuz firması" ara
   → Çıkan firmaların web sitesine bak
   → Web sitesi varsa potansiyel müşteri
```

### Satış Mesajı (WhatsApp)

```
"Merhaba [Firma Adı],

Müşterilerinize kendi evlerinde 
havuzun nasıl görüneceğini 
20 saniyede gösterebilirsiniz.

Müşteri fotoğraf yüklüyor,
model seçiyor, AI görsel oluşturuyor.
Boşa keşif gezisi yok.

[Demo video linki]

10 dakikada sitenize kurulur.
İlk ay ücretsiz deneyin.

Görüşelim mi?"
```

### Demo Süreci

```
1. WhatsApp'tan ulaş
2. Demo video gönder
3. İlgilenirlerse:
   → "Kendi sitenizde göstereyim"
   → Test firma oluştur, onların sitesine kur
   → Canlı demo yap (ekran paylaşım)
4. Kapatma:
   → "İlk ay ücretsiz, beğenirseniz devam"
   → Kurulum ücreti al (2.000 TL)
   → İlk ay faturasını kes
```

---

## 🔧 Teknik Notlar

### Prompt Kalitesi İçin

```
Nano Banana Pro (mevcut) sorunları:
├── URL 400 hatası → Supabase bucket public değil
├── 422 hatası → Referans görsel erişilemiyor

Çözüm sırası:
1. Supabase assets bucket'ı public yap
2. URL'leri test et (tarayıcıda aç)
3. Görsel üretimi tekrar dene
4. Bozuk çıkıyorsa → 2 görsel üret, birini seçtir
```

### Ölçeklenebilirlik

```
Şu anki plan 50 firmaya kadar sorunsuz çalışır.
50+ firmada:
├── Vercel Pro gerekir ($20/ay)
├── Supabase Pro gerekir ($25/ay)
└── fal.ai maliyeti artar (sabit oran)
```

---

## ✅ Öncelik Sırası (Hemen Yapılacaklar)

```
KRİTİK (sistemi çalıştır):
□ 1. Supabase assets → public yap
□ 2. Görsel URL'lerini test et
□ 3. Görsel üretimi çalıştır

ÖNEMLI (SaaS'a hazırla):
□ 4. client_configs tablosu oluştur
□ 5. /api/config endpoint yaz
□ 6. Form bileşenlerini dinamik yap
□ 7. Config paneli yaz

SATIŞA HAZIR:
□ 8. Demo video çek
□ 9. Landing page yap
□ 10. İlk 5 firmaya ulaş
```

---

*HavuzAI SaaS Dönüşüm Planı — Haziran 2026*
