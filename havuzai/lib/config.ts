import { supabaseAdmin } from "./supabase";
import type { ClientConfig, PoolModel, ColorOption, Features } from "./config-types";
import {
  defaultConfig,
  DEFAULT_POOL_MODELS,
  DEFAULT_DECK_COLORS,
  DEFAULT_CERAMIC_COLORS,
  DEFAULT_FEATURES,
  DEFAULT_BRAND,
} from "./config-defaults";

const CATEGORIES = ["fiber", "beton", "sus"] as const;

/**
 * DB'den gelen ham veriyi güvenli hale getirir: eksik alanlar (özellikle sizes) tüketicileri
 * çökertmesin; eski şemadaki `reference_image` alanı `reference_image_url`'e taşınsın.
 */
function normalizeModel(m: Record<string, unknown>): PoolModel {
  return {
    id: String(m.id ?? ""),
    name: String(m.name ?? m.id ?? ""),
    sub: m.sub != null ? String(m.sub) : undefined,
    category: CATEGORIES.find((c) => c === m.category) ?? "fiber",
    description: String(m.description ?? ""),
    prompt_description: m.prompt_description != null ? String(m.prompt_description) : undefined,
    tag: m.tag != null ? String(m.tag) : undefined,
    reference_image_url: String(m.reference_image_url ?? m.reference_image ?? ""),
    reference_image_url_2: m.reference_image_url_2 != null ? String(m.reference_image_url_2) : undefined,
    sizes: Array.isArray(m.sizes) ? m.sizes.map(String) : [],
  };
}

function normalizeColor(c: Record<string, unknown>): ColorOption {
  return {
    id: String(c.id ?? ""),
    name: String(c.name ?? ""),
    hex: String(c.hex ?? ""),
  };
}

/** Boş/eksik görsel alanı varsayılana düşsün (DB'de "" kalmışsa kart görseli kaybolmasın). */
function imageOrDefault(value: unknown, fallback?: string): string | undefined {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function normalizeFeatures(raw: unknown): Features {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    ...DEFAULT_FEATURES,
    ...(r as Partial<Features>),
    deck_image_url:      imageOrDefault(r.deck_image_url,      DEFAULT_FEATURES.deck_image_url),
    ceramic_image_url:   imageOrDefault(r.ceramic_image_url,   DEFAULT_FEATURES.ceramic_image_url),
    waterfall_image_url: imageOrDefault(r.waterfall_image_url, DEFAULT_FEATURES.waterfall_image_url),
    stairs_image_url:    imageOrDefault(r.stairs_image_url,    DEFAULT_FEATURES.stairs_image_url),
  };
}

/**
 * Bir firmanın tam konfigürasyonunu döner.
 *
 * client_configs satırı yoksa → tam varsayılan katalog.
 * Satır var ama bir alan boşsa (ör. henüz seed edilmemiş [] dizisi) → o alan için
 * varsayılan devreye girer. Böylece config motoru devreye girene kadar mevcut firma
 * birebir aynı çalışır (regresyon = 0).
 */
export async function getClientConfig(clientId: string): Promise<ClientConfig> {
  const fallback = defaultConfig(clientId);

  if (!supabaseAdmin) return fallback;

  const { data, error } = await supabaseAdmin
    .from("client_configs")
    .select("pool_models, deck_colors, ceramic_colors, features, brand, contact")
    .eq("client_id", clientId)
    .maybeSingle();

  if (error || !data) return fallback;

  const arr = (v: unknown): Record<string, unknown>[] =>
    Array.isArray(v) ? (v as Record<string, unknown>[]) : [];

  const models = arr(data.pool_models).map(normalizeModel);
  const decks = arr(data.deck_colors).map(normalizeColor);
  const ceramics = arr(data.ceramic_colors).map(normalizeColor);

  return {
    client_id: clientId,
    pool_models: models.length > 0 ? models : DEFAULT_POOL_MODELS,
    deck_colors: decks.length > 0 ? decks : DEFAULT_DECK_COLORS,
    ceramic_colors: ceramics.length > 0 ? ceramics : DEFAULT_CERAMIC_COLORS,
    features: normalizeFeatures(data.features),
    brand: { ...DEFAULT_BRAND, ...(data.brand || {}) },
    contact: { ...(data.contact || {}) },
  };
}