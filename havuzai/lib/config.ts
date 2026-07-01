import { supabaseAdmin } from "./supabase";
import type { ClientConfig } from "./config-types";
import {
  defaultConfig,
  DEFAULT_POOL_MODELS,
  DEFAULT_DECK_COLORS,
  DEFAULT_CERAMIC_COLORS,
  DEFAULT_FEATURES,
  DEFAULT_BRAND,
} from "./config-defaults";

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

  const nonEmptyArr = <T>(v: unknown, def: T[]): T[] =>
    Array.isArray(v) && v.length > 0 ? (v as T[]) : def;

  return {
    client_id: clientId,
    pool_models: nonEmptyArr(data.pool_models, DEFAULT_POOL_MODELS),
    deck_colors: nonEmptyArr(data.deck_colors, DEFAULT_DECK_COLORS),
    ceramic_colors: nonEmptyArr(data.ceramic_colors, DEFAULT_CERAMIC_COLORS),
    features: { ...DEFAULT_FEATURES, ...(data.features || {}) },
    brand: { ...DEFAULT_BRAND, ...(data.brand || {}) },
    contact: { ...(data.contact || {}) },
  };
}
