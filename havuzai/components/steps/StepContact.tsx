"use client";

import { useEffect, useState } from "react";
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

interface Place { id: number; name: string; }

export default function StepContact({ form, update }: Props) {
  const [provinces, setProvinces]   = useState<Place[]>([]);
  const [districts, setDistricts]   = useState<Place[]>([]);
  const [provinceId, setProvinceId] = useState<string>("");
  const [districtId, setDistrictId] = useState<string>("");
  const [loadingProv, setLoadingProv] = useState(true);
  const [loadingDist, setLoadingDist] = useState(false);

  // İlleri bir kez yükle — kendi sunucumuzdaki proxy route'u üzerinden (CORS/ağ riskini bertaraf eder)
  useEffect(() => {
    fetch("/api/geo/provinces")
      .then((r) => r.json())
      .then((d) => setProvinces(d.provinces || []))
      .catch(() => setProvinces([]))
      .finally(() => setLoadingProv(false));
  }, []);

  // Geri gelindiğinde (form.customerCity zaten "İlçe, İl" içeriyorsa) seçimleri geri kur
  useEffect(() => {
    if (!provinces.length || !form.customerCity) return;
    const parts = form.customerCity.split(",").map((s) => s.trim());
    const provinceName = parts[parts.length - 1];
    const match = provinces.find((p) => p.name === provinceName);
    if (match && String(match.id) !== provinceId) {
      setProvinceId(String(match.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinces]);

  // İl seçilince o ile ait ilçeleri yükle — kendi sunucumuzdaki proxy route'u üzerinden
  useEffect(() => {
    if (!provinceId) { setDistricts([]); return; }
    setLoadingDist(true);
    fetch(`/api/geo/districts?provinceId=${provinceId}`)
      .then((r) => r.json())
      .then((d) => {
        const list: Place[] = d.districts || [];
        setDistricts(list);
        // Geri gelindiyse ilçeyi de eşleştirip seç
        if (form.customerCity) {
          const parts = form.customerCity.split(",").map((s) => s.trim());
          const districtName = parts[0];
          const match = list.find((x) => x.name === districtName);
          if (match) setDistrictId(String(match.id));
        }
      })
      .catch(() => setDistricts([]))
      .finally(() => setLoadingDist(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinceId]);

  const handleProvinceChange = (id: string) => {
    setProvinceId(id);
    setDistrictId("");
    const p = provinces.find((x) => String(x.id) === id);
    update({ customerCity: p ? p.name : "" });
  };

  const handleDistrictChange = (id: string) => {
    setDistrictId(id);
    const p = provinces.find((x) => String(x.id) === provinceId);
    const d = districts.find((x) => String(x.id) === id);
    if (p && d) update({ customerCity: `${d.name}, ${p.name}` });
  };

  const selectCls = "input-base";

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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--navy)" }}>
              İl *
            </label>
            <select
              className={selectCls}
              value={provinceId}
              disabled={loadingProv}
              onChange={(e) => handleProvinceChange(e.target.value)}
            >
              <option value="">{loadingProv ? "Yükleniyor..." : "İl seçin"}</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--navy)" }}>
              İlçe *
            </label>
            <select
              className={selectCls}
              value={districtId}
              disabled={!provinceId || loadingDist}
              onChange={(e) => handleDistrictChange(e.target.value)}
            >
              <option value="">
                {!provinceId ? "Önce il seçin" : loadingDist ? "Yükleniyor..." : "İlçe seçin"}
              </option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        <Field
          label="Sokak / Cadde, Bina No *"
          value={form.customerAddress}
          onChange={(v) => update({ customerAddress: v })}
          placeholder="Örn: Küçüksu Caddesi, No:6/8"
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