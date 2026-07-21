/**
 * Firma (client) konfigürasyon tipleri.
 */

export interface PoolModel {
  id: string;
  name: string;
  sub?: string;
  description: string;
  prompt_description?: string;
  tag?: string;
  reference_image_url: string;
  reference_image_url_2?: string;
  sizes: string[];
}

export interface ColorOption {
  id: string;
  name: string;
  hex: string;
  /** Malzemenin yakın çekim/net referans fotoğrafı (isteğe bağlı, public URL). */
  reference_image_url?: string;
}

export interface Features {
  waterfall: boolean;
  stairs: boolean;
  stair_reference_url?: string;
}

export interface Brand {
  primary_color?: string;
  logo_url?: string;
  company_name?: string;
}

export interface Contact {
  phone?: string;
  whatsapp?: string;
  email?: string;
}

export interface ClientConfig {
  client_id: string;
  pool_models: PoolModel[];
  deck_colors: ColorOption[];
  ceramic_colors: ColorOption[];
  features: Features;
  brand: Brand;
  contact: Contact;
}