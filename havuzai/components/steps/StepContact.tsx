"use client";

import type { FormData } from "@/app/app/page";

interface Props { form: FormData; update: (d: Partial<FormData>) => void; }

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  hint?: string;
}

function Field({ label, value, onChange, placeholder, type = "text", hint }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5"
        style={{ color: "var(--navy)" }}>
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="input-base resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="input-base"
        />
      )}
      {hint && (
        <p className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>{hint}</p>
      )}
    </div>
  );
}

export default function StepContact({ form, update }: Props) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest mb-1"
        style={{ color: "var(--gold)" }}>Son Adım</p>
      <h2 className="font-display text-2xl font-bold mb-1" style={{ color: "var(--navy)" }}>
        İletişim bilgileri
      </h2>
      <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
        Uzmanlarımız size özel teklifle geri dönecek.
      </p>

      <div className="flex flex-col gap-4">
        <Field
          label="Ad Soyad *"
          value={form.customerName}
          onChange={(v) => update({ customerName: v })}
          placeholder="Ahmet Yılmaz"
        />
        <Field
          label="Telefon *"
          value={form.customerPhone}
          onChange={(v) => update({ customerPhone: v })}
          placeholder="0532 123 45 67"
          type="tel"
          hint="Sizi bu numaradan arayacağız."
        />
        <Field
          label="Adres / Konum *"
          value={form.customerAddress}
          onChange={(v) => update({ customerAddress: v })}
          placeholder="İl, ilçe, mahalle..."
          type="textarea"
        />
      </div>

      {/* Trust row */}
      <div className="flex items-center gap-4 mt-5 pt-4"
        style={{ borderTop: "1px solid var(--border-soft)" }}>
        {[
          { icon: "🔒", text: "Gizlilik korunur" },
          { icon: "📞", text: "Ücretsiz teklif" },
          { icon: "⚡", text: "24 saat içinde" },
        ].map((b) => (
          <div key={b.text} className="flex items-center gap-1.5">
            <span style={{ fontSize: "12px" }}>{b.icon}</span>
            <span className="text-xs" style={{ color: "var(--text-faint)" }}>{b.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
