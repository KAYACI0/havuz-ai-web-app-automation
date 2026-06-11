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
    pool_model: string;
    pool_size: string;
    deck_type?: string;
    ceramic_type?: string;
  }
): Promise<void> {
  if (!resend) return;

  await resend.emails.send({
    from: "HavuzAI <bildirim@havuzai.com.tr>",
    to,
    subject: "🏊 Yeni Havuz Talebi Geldi!",
    html: `
      <h2>🏊 Yeni Havuz Talebi — ${clientName}</h2>
      <hr/>
      <p><strong>Müşteri:</strong> ${order.customer_name}</p>
      <p><strong>Telefon:</strong> ${order.customer_phone}</p>
      <p><strong>Adres:</strong> ${order.customer_address}</p>
      <hr/>
      <p><strong>Havuz Modeli:</strong> ${order.pool_model}</p>
      <p><strong>Ölçü:</strong> ${order.pool_size}</p>
      <p><strong>Deck:</strong> ${order.deck_type || "-"}</p>
      <p><strong>Seramik:</strong> ${order.ceramic_type || "-"}</p>
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
