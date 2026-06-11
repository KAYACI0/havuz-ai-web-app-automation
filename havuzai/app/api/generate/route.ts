import { supabaseAdmin } from "@/lib/supabase";
import { generatePoolImage, uploadPhotoToFal } from "@/lib/fal";
import { buildPoolPrompt } from "@/lib/prompt";
import { sendOrderNotification } from "@/lib/email";
import { log } from "@/lib/logger";

export async function POST(request: Request) {
  const requestId = crypto.randomUUID().slice(0, 8);

  try {
    const formData = await request.formData();

    const clientId      = formData.get("clientId") as string;
    const photo         = formData.get("photo") as File;
    const poolModel     = formData.get("poolModel") as string;
    const poolSize      = formData.get("poolSize") as string;
    const deckType      = formData.get("deckType") as string;
    const ceramicType   = formData.get("ceramicType") as string;
    const customerName  = formData.get("customerName") as string;
    const customerPhone = formData.get("customerPhone") as string;
    const customerAddr  = formData.get("customerAddress") as string;
    const customerCity  = formData.get("customerCity") as string;
    const source        = (formData.get("source") as string) || "direct";

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
      log("error", `[${requestId}] 1-FORM`, "Eksik alan", { missing, hasPhoto: !!photo, poolModel, poolSize, customerName, customerPhone });
      return Response.json({ success: false, error: `Eksik alan: ${missing.join(", ")}` }, { status: 400 });
    }

    // 1. Fotoğrafı yükle
    let originalPhotoUrl = "";
    const photoBuffer = await photo.arrayBuffer();

    if (supabaseAdmin) {
      log("info", `[${requestId}] 2-UPLOAD`, "Supabase Storage'a yükleniyor...");
      const fileName = `${clientId}/${Date.now()}-original.jpg`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from("photos")
        .upload(fileName, photoBuffer, { contentType: photo.type || "image/jpeg" });

      if (uploadError) {
        log("info", `[${requestId}] 2-UPLOAD`, "Storage hatası, base64 kullanılıyor", { msg: uploadError.message });
      } else {
        const { data: urlData } = supabaseAdmin.storage.from("photos").getPublicUrl(fileName);
        originalPhotoUrl = urlData.publicUrl;
        log("success", `[${requestId}] 2-UPLOAD`, "Yükleme tamam", { url: originalPhotoUrl });
      }
    }

    if (!originalPhotoUrl) {
      log("info", `[${requestId}] 2-UPLOAD`, "fal.storage'a yükleniyor...");
      originalPhotoUrl = await uploadPhotoToFal(photoBuffer, photo.type || "image/jpeg");
      log("success", `[${requestId}] 2-UPLOAD`, "fal.storage yükleme tamam", { url: originalPhotoUrl });
    }

    // 2. Prompt oluştur
    const prompt = buildPoolPrompt(poolModel, poolSize, deckType, ceramicType);
    log("info", `[${requestId}] 3-PROMPT`, "Prompt hazır", { prompt });

    // 3. fal.ai görsel üret
    log("info", `[${requestId}] 4-FAL`, "fal.ai isteği gönderiliyor...");
    const aiPhotoUrl = await generatePoolImage(originalPhotoUrl, prompt);
    log("success", `[${requestId}] 4-FAL`, "Görsel üretildi", { aiPhotoUrl });

    // 4. Supabase'e kaydet
    if (!supabaseAdmin) {
      log("error", `[${requestId}] 5-DB`, "Supabase bağlantısı yok — SUPABASE_URL veya SUPABASE_SERVICE_KEY eksik");
      return Response.json(
        { success: false, error: "Veritabanı bağlantısı kurulamadı" },
        { status: 500 }
      );
    }

    // clientId geçerli mi kontrol et
    const { data: clientRow, error: clientError } = await supabaseAdmin
      .from("clients")
      .select("id")
      .eq("id", clientId)
      .single();

    if (clientError || !clientRow) {
      log("error", `[${requestId}] 5-DB`, "Geçersiz clientId — clients tablosunda bulunamadı", { clientId, msg: clientError?.message });
      return Response.json(
        { success: false, error: `Geçersiz firma kimliği: ${clientId}` },
        { status: 400 }
      );
    }

    log("info", `[${requestId}] 5-DB`, "Sipariş veritabanına kaydediliyor...");
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        client_id:        clientId,
        customer_name:    customerName,
        customer_phone:   customerPhone,
        customer_address: customerAddr,
        customer_city:    customerCity,
        pool_model:       poolModel,
        pool_size:        poolSize,
        deck_type:        deckType || null,
        ceramic_type:     ceramicType || null,
        original_photo:   originalPhotoUrl,
        ai_photo:         aiPhotoUrl,
        source,
      })
      .select()
      .single();

    if (orderError) {
      log("error", `[${requestId}] 5-DB`, "DB kayıt hatası", {
        msg:  orderError.message,
        code: orderError.code,
        details: orderError.details,
        hint: orderError.hint,
      });
      return Response.json(
        { success: false, error: `Sipariş kaydedilemedi: ${orderError.message}` },
        { status: 500 }
      );
    }
    log("success", `[${requestId}] 5-DB`, "Sipariş kaydedildi", { orderId: order.id });

    // 5. Kullanım logu (non-fatal)
    void supabaseAdmin.from("usage_logs").insert({
      client_id: clientId, order_id: order.id,
      action: "image_generated", cost_usd: 0.04,
    });

    // 6. E-posta bildirimi (non-fatal)
    void supabaseAdmin.from("clients").select("email, name").eq("id", clientId).single()
      .then(({ data: client }) => {
        if (client) {
          log("info", `[${requestId}] 6-EMAIL`, "E-posta gönderiliyor...", { to: client.email });
          void sendOrderNotification(client.email, client.name, order);
        }
      });

    log("success", `[${requestId}] DONE`, "Sipariş tamamlandı", { orderId: order.id });

    return Response.json({
      success:  true,
      orderId:  order.id,
      aiPhoto:  aiPhotoUrl,
      original: originalPhotoUrl,
    });

  } catch (error: unknown) {
    const err = error as { status?: number; body?: unknown; message?: string; stack?: string };
    log("error", `[${requestId}] ERROR`, err?.message || "Bilinmeyen hata", {
      http_status: err?.status,
      body:        err?.body,
      stack:       err?.stack?.split("\n").slice(0, 6),
    });
    return Response.json(
      {
        success: false,
        error:   "Görsel oluşturulamadı",
        debug: {
          message:     err?.message,
          http_status: err?.status,
          body:        err?.body,
        },
      },
      { status: 500 }
    );
  }
}
