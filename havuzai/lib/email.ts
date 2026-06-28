import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendOrderNotification(
  to: string,
  clientName: string,
  order: {
    customer_name: string;
    customer_phone: string;
    customer_address: string;
    customer_city?: string;
    pool_model: string;
    pool_size: string;
    deck_type?: string;
    ceramic_type?: string;
    has_waterfall?: boolean;
    has_stairs?: boolean;
    stair_type?: string;
  }
): Promise<void> {
  if (!resend) return;

  const DECK_LABELS: Record<string, string> = {
    ceviz: "Ceviz", antrasit04: "Antrasit 04", "koyu-kahve": "Koyu Kahve",
    yesil: "Yeşil", kirmizi: "Kırmızı", "gunes-sarisi": "Güneş Sarısı", bej: "Bej",
  };
  const CERAMIC_LABELS: Record<string, string> = {
    turkuaz: "Turkuaz", mavi: "Mavi", beyaz: "Beyaz", gri: "Gri", krem: "Krem",
  };
  const deckLabel    = order.deck_type ? (DECK_LABELS[order.deck_type] ?? order.deck_type) : "-";
  const ceramicLabel = order.ceramic_type ? (CERAMIC_LABELS[order.ceramic_type] ?? order.ceramic_type) : "-";

  await resend.emails.send({
    from: "HavuzAI <bildirim@havuz-ai-web-app-automation.vercel.app>",
    to,
    subject: "🏊 Yeni Havuz Talebi Geldi!",
    html: `
      <h2>🏊 Yeni Havuz Talebi — ${clientName}</h2>
      <hr/>
      <p><strong>Müşteri:</strong> ${order.customer_name}</p>
      <p><strong>Telefon:</strong> ${order.customer_phone}</p>
      <p><strong>Adres:</strong> ${order.customer_address}</p>
      ${order.customer_city ? `<p><strong>Şehir:</strong> ${order.customer_city}</p>` : ""}
      <hr/>
      <p><strong>Havuz Modeli:</strong> ${order.pool_model}</p>
      <p><strong>Ölçü:</strong> ${order.pool_size}</p>
      <p><strong>Deck (Çevre Rengi):</strong> ${deckLabel}</p>
      <p><strong>Seramik Rengi:</strong> ${ceramicLabel}</p>
      <p><strong>Havuz Şelalesi:</strong> ${order.has_waterfall ? "🌊 Var" : "Yok"}</p>
      <p><strong>Havuz Merdiveni:</strong> ${order.has_stairs ? "🪜 Var" : "Yok"}</p>
      <hr/>
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin"
           style="background:#0066cc;color:white;padding:12px 24px;
                  border-radius:6px;text-decoration:none;">
          Admin Panele Git →
        </a>
      </p>
    `,
  });
}
