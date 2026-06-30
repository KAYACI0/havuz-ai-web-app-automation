# 🪵 Deck & Seramik Spesifikasyonu (Çevre Adımı)

> **Kaynak:** Babanın 30.06.2026 tarihli sesli/yazılı notu
> **İlgili form adımı:** Step 4 — Çevre Seç (`StepEnvironment.tsx`)
> **Durum:** Taslak — bazı ölçüler eksik (aşağıda "Açık Sorular")

---

## 1. Babanın Mesajının Çözümü

Babam havuz çevresindeki **deck (ahşap kaplama) ve seramik bordürü kendisi tasarlayacak.**
Verdiği standart modül ölçüleri şunlar:

| Malzeme | Bir parçanın eni | 1 metre kaç parça |
|---------|------------------|-------------------|
| **Deck tahtası** | 20 cm | 5 adet (5 × 20 = 100 cm) ✓ |
| **Seramik** | 25 cm | 4 adet (4 × 25 = 100 cm) ✓ |

Yani:
- Deck, **20 cm enindeki tahtalardan** dizilecek → her **1 metrede 5 tahta**.
- Seramik, **25 cm enindeki karolardan** dizilecek → her **1 metrede 4 karo**.

> ⚠️ **ÖNEMLİ — Koda dokunma:** Deck ve seramik **aynı anda seçilemez**.
> Bu kasıtlı bir tasarım kararı (Enes ayarladı). Çevre olarak **ya deck ya seramik**
> seçilir, ikisi birden değil. Bunu bug sanıp `StepEnvironment` mantığını DEĞİŞTİRME.

## 2. Referans Havuz + Çevre Şeridi

- Havuz ölçüsü: **3 m × 6 m**
- Çevre (perimetre): 2 × (3 + 6) = **18 metre**
- **Çevre şeridi genişliği: 1 metre** (havuz her kenarından 1 m dışarı) ✅ *(babanın notu)*
- Dış ölçü: (3 + 2×1) × (6 + 2×1) = **5 m × 8 m = 40 m²**
- **Kaplanacak şerit alanı: 40 − 18 = 22 m²**

## 3. Malzeme Hesabı (1 m şerit, 22 m² alan)

Çevre **ya tamamen deck ya tamamen seramik** olacağı için (ikisi birlikte değil),
22 m²'lik şerit için iki ayrı senaryo:

### Senaryo A — Deck seçilirse
- Deck tahtası: 20 cm en, **boy 1,5–2 m yeterli** (baba doğruladı)
- 1 m²'yi kaplamak için **5 tahta-metre** (5 × 0,20 m × 1 m = 1 m²)
- 22 m² × 5 = **110 tahta-metre** + %10 fire ≈ **~121 tahta-metre**
- Adet (boya göre): 2 m boy → **~61 adet**, 1,5 m boy → **~81 adet**
  → yani **~60–80 tahta** (1,5–2 m boyunda)

### Senaryo B — Seramik seçilirse (DİKDÖRTGEN karo)
Seramik **dikdörtgen** (baba doğruladı). Bir kenarı **25 cm**, diğer kenarı (L) henüz net değil.

Formül (22 m² için): **karo adedi = 22 ÷ (0,25 × L)** = **88 ÷ L**  *(L = metre cinsinden ikinci kenar)*

| Olası ölçü | 1 karo alanı | 22 m² için adet | + %10 fire |
|------------|--------------|------------------|------------|
| 25 × 40 cm | 0,10 m² | 220 | **~242 karo** |
| 25 × 50 cm | 0,125 m² | 176 | **~194 karo** |
| 25 × 60 cm | 0,15 m² | ~147 | **~162 karo** |

> Babadan **ikinci kenar ölçüsü** gelince yukarıdaki tablodan kesin satır seçilecek.

## 4. Sisteme Etkisi (Geliştirme Notu)

Bu ölçüler şu noktalarda kullanılacak:

1. **AI Prompt** (`buildPrompt` → `app/api/generate/route.ts`)
   - Deck tahtalarının **20 cm aralıklı** görünmesi için prompt'a modül bilgisi eklenebilir.
   - Örn: `"wooden deck made of 20cm wide planks, ceramic border of 25cm tiles"`
2. **Çevre Seç adımı** (`StepEnvironment.tsx`)
   - Deck rengi + seramik seçimine ek olarak ileride **otomatik malzeme/adet hesabı** gösterilebilir.
3. **Sipariş kaydı** (`orders` tablosu)
   - `deck_type` / `ceramic_type` alanlarına ek olarak ileride modül ölçüsü saklanabilir.

## 5. Açık Sorular (Babama Sorulacak)

- [x] ~~Deck şeridi kaç metre dışarı taşacak?~~ → **Her kenardan 1 metre** ✅
- [ ] Seramik **havuz kenarında mı** (su kenarı bordürü) yoksa deckten sonra mı?
- [x] ~~Deck tahtalarının boyu?~~ → **1,5–2 m yeterli** ✅
- [x] ~~Seramik kare mi dikdörtgen mi?~~ → **Dikdörtgen** ✅ (ikinci kenar ölçüsü hâlâ lazım)
- [ ] Dikdörtgen seramiğin **ikinci kenarı** kaç cm? (25 × ? )
- [ ] 3×6 dışında başka standart ölçüler de olacak mı? (3×5, 4×8 vb.)
