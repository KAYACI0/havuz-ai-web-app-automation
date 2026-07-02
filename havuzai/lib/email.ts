import { Resend } from "resend";
import type { ClientConfig } from "./config-types";

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
  },
  config?: ClientConfig
): Promise<void> {
  if (!resend) return;

  // Deck/seramik id → ad çözümü firma config'inden (yoksa ham id).
  const deckLabel    = order.deck_type
    ? (config?.deck_colors.find(d => d.id === order.deck_type)?.name ?? order.deck_type)
    : "-";
  const ceramicLabel = order.ceramic_type
    ? (config?.ceramic_colors.find(c => c.id === order.ceramic_type)?.name ?? order.ceramic_type)
    : "-";

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
