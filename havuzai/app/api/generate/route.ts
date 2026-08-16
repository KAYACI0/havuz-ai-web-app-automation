import { supabaseAdmin } from "@/lib/supabase";
import { generatePoolVisualization } from "@/lib/fal";
import { sendOrderNotification } from "@/lib/email";
import { getClientConfig } from "@/lib/config";
import { log } from "@/lib/logger";
import type { PoolConfig } from "@/lib/prompt";

// Bu numaralar limit kontrolünden tamamen muaf — sınırsız üretim.
// Vercel env: ADMIN_PHONE_WHITELIST=905xxxxxxxxx,905yyyyyyyyy (virgülle ayrılmış, boşluksuz)
const ADMIN_PHONE_WHITELIST = (process.env.ADMIN_PHONE_WHITELIST || "")
  .split(",")
  .map((p) => p.trim())
  .filter(Boolean);

/** Telefon numarasını sadece rakamlara indirger — "+90 555 123 45 67" ile
 *  "05551234567" gibi farklı yazımların aynı numara sayılması için. */
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** İstek başlıklarından gerçek client IP'sini çıkarır (Vercel/proxy arkasında). */
function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID().slice(0, 8);

  try {
    const formData = await request.formData();

    const clientId     = formData.get("clientId") as string;
    const photo        = formData.get("photo") as File;
    const poolModel    = formData.get("poolModel") as string;
    const poolSize     = formData.get("poolSize") as string;
    const deckType     = formData.get("deckType") as string;
    const ceramicType  = formData.get("ceramicType") as string;
    const customerName = formData.get("customerName") as string;
    const customerPhone = formData.get("customerPhone") as string;
    const customerAddr  = formData.get("customerAddress") as string;
    const customerCity  = formData.get("customerCity") as string;
    const source        = (formData.get("source") as string) || "direct";
    const hasWaterfall  = formData.get("hasWaterfall") === "true";
    const hasStairs     = formData.get("hasStairs") === "true";
    const stairType     = (formData.get("stairType") as "corner" | "wide") || "corner";

    log("info", `[${requestId}] 1-FORM`, "Form alındı", {
      clientId, poolModel, poolSize, deckType, ceramicType,
      customerName, customerPhone, photoName: photo?.name, photoSize: photo?.size,
    });

    const missing = [
      !clientId      && "clientId",
      !photo         && "photo",
      !poolModel     && "poolModel",
      !poolSize      && "poolSize",
      !customerName  && "customerName",
      !customerPhone && "customerPhone",
    ].filter(Boolean);

    if (missing.length > 0) {
      log("error", `[${requestId}] 1-FORM`, "Eksik alan", { missing });
      return Response.json({ success: false, error: `Eksik alan: ${missing.join(", ")}` }, { status: 400 });
    }

    if (!supabaseAdmin) {
      log("error", `[${requestId}] 2-UPLOAD`, "Supabase bağlantısı yok");
      return Response.json({ success: false, error: "Veritabanı bağlantısı kurulamadı" }, { status: 500 });
    }

    // === LİMİT KONTROLÜ ===
    // Whitelist'teki numaralar (biz/admin) tamamen muaf — direkt geç.
    const normalizedPhone = normalizePhone(customerPhone);
    const isWhitelisted = ADMIN_PHONE_WHITELIST.some(
      (wp) => normalizePhone(wp) === normalizedPhone
    );

    if (!isWhitelisted) {
      const clientIp = getClientIp(request);

      log("info", `[${requestId}] 1b-LIMIT`, "Limit kontrolü yapılıyor...", {
        phone: normalizedPhone, ip: clientIp,
      });

      const { data: existingOrders, error: limitCheckError } = await supabaseAdmin
        .from("orders")
        .select("id, customer_phone, customer_ip")
        .or(`customer_phone.eq.${customerPhone},customer_ip.eq.${clientIp}`)
        .limit(1);

      if (limitCheckError) {
        // DB kontrolü başarısız olursa, güvenli tarafta kalmak için isteği reddetmek yerine
        // sadece logluyoruz ve devam ediyoruz — bir yanlış pozitifle gerçek müşteriyi
        // engellememek için. İstersen bunu daha katı hale getirip request'i durdurabiliriz.
        log("error", `[${requestId}] 1b-LIMIT`, "Limit kontrolü sorgusu başarısız", {
          msg: limitCheckError.message,
        });
      } else if (existingOrders && existingOrders.length > 0) {
        log("info", `[${requestId}] 1b-LIMIT`, "Limit doldu — reddedildi", {
          phone: normalizedPhone, ip: clientIp,
        });
        return Response.json(
          { success: false, error: "Daha önce görsel oluşturduğunuz  havuz görseli için telefon numaramızdan iletişime geçiniz" },
          { status: 429 }
        );
      }
    } else {
      log("info", `[${requestId}] 1b-LIMIT`, "Whitelist numarası — limit atlandı", {
        phone: normalizedPhone,
      });
    }
    // === LİMİT KONTROLÜ SONU ===

    const photoBuffer = await photo.arrayBuffer();

    log("info", `[${requestId}] 2-UPLOAD`, "Supabase Storage'a yükleniyor...");
    const fileName = `${clientId}/${Date.now()}-original.jpg`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("photos")
      .upload(fileName, photoBuffer, { contentType: photo.type || "image/jpeg" });

    if (uploadError) {
      log("error", `[${requestId}] 2-UPLOAD`, "Storage yükleme hatası", { msg: uploadError.message });
      return Response.json({ success: false, error: "Fotoğraf yüklenemedi: " + uploadError.message }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage.from("photos").getPublicUrl(fileName);
    const originalPhotoUrl = urlData.publicUrl;
    log("success", `[${requestId}] 2-UPLOAD`, "Yükleme tamam", { url: originalPhotoUrl });

    const poolConfig: PoolConfig = {
      model:        poolModel,
      size:         poolSize,
      deck:         deckType,
      ceramic:      ceramicType,
      hasWaterfall,
      hasStairs,
      stairType,
    };

    const clientConfig = await getClientConfig(clientId);

    log("info", `[${requestId}] 4-FAL`, "fal.ai isteği gönderiliyor...");

    let aiPhotoUrl: string;
    try {
      ({ aiImageUrl: aiPhotoUrl } = await generatePoolVisualization(originalPhotoUrl, poolConfig, clientConfig));
    } catch {
      log("info", `[${requestId}] 4-FAL`, "İlk deneme başarısız, yeniden deneniyor...");
      ({ aiImageUrl: aiPhotoUrl } = await generatePoolVisualization(originalPhotoUrl, poolConfig, clientConfig));
    }
    log("success", `[${requestId}] 4-FAL`, "Görsel üretildi", { aiPhotoUrl });

    const { data: clientRow, error: clientError } = await supabaseAdmin
      .from("clients").select("id").eq("id", clientId).single();

    if (clientError || !clientRow) {
      log("error", `[${requestId}] 5-DB`, "Geçersiz clientId", { clientId });
      return Response.json({ success: false, error: `Geçersiz firma kimliği: ${clientId}` }, { status: 400 });
    }

    log("info", `[${requestId}] 5-DB`, "Sipariş veritabanına kaydediliyor...");
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        client_id:        clientId,
        customer_name:    customerName,
        customer_phone:   customerPhone,
        customer_ip:      getClientIp(request),
        customer_address: customerAddr,
        customer_city:    customerCity,
        pool_model:       poolModel,
        pool_size:        poolSize,
        deck_type:        deckType || null,
        ceramic_type:     ceramicType || null,
        stair_type:       stairType,
        has_waterfall:    hasWaterfall,
        has_stairs:       hasStairs,
        original_photo:   originalPhotoUrl,
        ai_photo:         aiPhotoUrl,
        source,
      })
      .select()
      .single();

    if (orderError) {
      log("error", `[${requestId}] 5-DB`, "DB kayıt hatası", { msg: orderError.message, code: orderError.code });
      return Response.json({ success: false, error: `Sipariş kaydedilemedi: ${orderError.message}` }, { status: 500 });
    }
    log("success", `[${requestId}] 5-DB`, "Sipariş kaydedildi", { orderId: order.id });

    void supabaseAdmin.from("usage_logs").insert({ client_id: clientId, order_id: order.id, action: "image_generated", cost_usd: 0.04 });

    void supabaseAdmin.from("clients").select("email, name").eq("id", clientId).single()
      .then(({ data: client }) => {
        if (client) {
          log("info", `[${requestId}] 6-EMAIL`, "E-posta gönderiliyor...", { to: client.email });
          void sendOrderNotification(client.email, client.name, order, clientConfig);
        }
      });

    log("success", `[${requestId}] DONE`, "Sipariş tamamlandı", { orderId: order.id });

    return Response.json({ success: true, orderId: order.id, aiPhoto: aiPhotoUrl, original: originalPhotoUrl });

  } catch (error: unknown) {
    const err = error as { status?: number; body?: unknown; message?: string; stack?: string };
    log("error", `[${requestId}] ERROR`, err?.message || "Bilinmeyen hata", {
      http_status: err?.status, body: err?.body, stack: err?.stack?.split("\n").slice(0, 6),
    });
    return Response.json({ success: false, error: "Görsel oluşturulamadı", debug: { message: err?.message, http_status: err?.status, body: err?.body } }, { status: 500 });
  }
}