/**
 * Firma (client) konfigürasyon tipleri.
 * client_configs tablosundaki JSONB kolonlarının TypeScript karşılığı.
 * Hem müşteri formu, hem prompt/fal, hem de super-admin config paneli bu tipleri kullanır.
 */

/** Bir havuz modeli — firma bazında tanımlanır. */
export interface PoolModel {
  /** Kararlı kimlik (orders.pool_model'e yazılır). Örn: "RELAX" */
  id: string;
  /** Görünen ad. Örn: "RELAX" */
  name: string;
  /** İsteğe bağlı alt başlık. Örn: "Organik & Aile" */
  sub?: string;
  /** Kart açıklaması (müşteriye gösterilir). */
  description: string;
  /**
   * AI prompt'unda kullanılan detaylı şekil açıklaması (İngilizce önerilir).
   * Boşsa `description` kullanılır. Ayrı tutulur çünkü AI çıktısı şekil metnine hassas.
   */
  prompt_description?: string;
  /** Kart rozeti. Örn: "En Popüler" */
  tag?: string;
  /** fal.ai'ye gönderilen referans görsel (public URL). */
  reference_image_url: string;
  /** Bu modele uygun ölçüler. Örn: ["3x5x1.5", "3x6x1.5"] */
  sizes: string[];
}

/** Deck / seramik renk seçeneği. */
export interface ColorOption {
  /** Kararlı kimlik (orders.deck_type / ceramic_type'a yazılır). Örn: "ceviz" */
  id: string;
  /** Görünen ad. Örn: "Ceviz" */
  name: string;
  /** Önizleme rengi (deck: düz hex; seramik: hex veya CSS gradient stringi). */
  hex: string;
}

/** Formda gösterilen/gizlenen ekstra özellikler. */
export interface Features {
  waterfall: boolean;
  stairs: boolean;
}

/** Marka görünümü. */
export interface Brand {
  primary_color?: string;
  logo_url?: string;
  company_name?: string;
}

/** Sonuç sayfasında gösterilen iletişim bilgileri. */
export interface Contact {
  phone?: string;
  whatsapp?: string;
  email?: string;
}

/** Tam firma konfigürasyonu (getClientConfig çıktısı — defaults ile doldurulmuş). */
export interface ClientConfig {
  client_id: string;
  pool_models: PoolModel[];
  deck_colors: ColorOption[];
  ceramic_colors: ColorOption[];
  features: Features;
  brand: Brand;
  contact: Contact;
}
