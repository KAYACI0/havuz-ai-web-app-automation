"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import type { ClientConfig } from "@/lib/config-types";
import StepPhoto from "@/components/steps/StepPhoto";
import StepModel from "@/components/steps/StepModel";
import StepSize from "@/components/steps/StepSize";
import StepEnvironment from "@/components/steps/StepEnvironment";
import StepContact from "@/components/steps/StepContact";
import LoadingScreen from "@/components/LoadingScreen";
import HowToUse from "@/components/HowToUse";

const FORM_GUIDE = [
  { icon: "📷", title: "Fotoğraf Yükleyin", desc: "Bahçenizi veya arka bahçenizi net şekilde gösteren bir fotoğraf seçin." },
  { icon: "🏊", title: "Havuz Modelini Seçin", desc: "Bahçenize en uygun havuz modelini seçin." },
  { icon: "📐", title: "Ölçü Belirleyin", desc: "Bahçenizin büyüklüğüne uygun havuz boyutunu seçin." },
  { icon: "🌿", title: "Özellikleri İşaretleyin", desc: "Havuz etrafı kaplama, şelale ve merdiven gibi istediğiniz özellikleri işaretleyin." },
  { icon: "👤", title: "Bilgilerinizi Girin", desc: "Ad, telefon ve adres bilgilerinizi girerek görselimi oluştur butonuna tıklayın." },
];

export interface FormData {
  photo:           File | null;
  poolModel:       string;
  poolSize:        string;
  gardenLength:    string;
  gardenWidth:     string;
  deckType:        string;
  ceramicType:     string;
  customerName:    string;
  customerPhone:   string;
  customerCity:    string;
  customerAddress: string;
  hasWaterfall:    boolean;
  hasStairs:       boolean;
  stairType:       "corner" | "wide";
}

/**
 * Adımların mantıksal kimlikleri (id) sabittir: 1 Fotoğraf, 2 Model, 3 Ölçü, 4 Özellik, 5 İletişim.
 * Ekranda görünen numara, o akışta kaç adım olduğuna göre hesaplanır.
 */
const ALL_STEPS = [
  { id: 1, label: "Fotoğraf", icon: "📷" },
  { id: 2, label: "Model",    icon: "🏊" },
  { id: 3, label: "Ölçü",     icon: "📐" },
  { id: 4, label: "Özellik",  icon: "🌿" },
  { id: 5, label: "İletişim", icon: "👤" },
];

type StepDef = (typeof ALL_STEPS)[number];

/** Süs havuzu akışı: Fotoğraf -> Model -> İletişim */
const ORNAMENTAL_STEP_IDS = [1, 2, 5];

const HEADLINES: Record<number, string> = {
  1: "Hayalinizdeki havuzu evinizde görün.",
  2: "Hangi model size uygun?",
  3: "Doğru ölçü, mükemmel uyum.",
  4: "İstediğiniz özellikleri işaretleyin.",
  5: "Son adım — teklif hemen hazır.",
};

/** İletişim alanlarını gerçekten anlamlı mı diye kontrol eder — sadece "boş değil" yetmez. */
function isContactValid(form: FormData): boolean {
  const name = form.customerName.trim();
  const phoneDigits = form.customerPhone.replace(/\D/g, "");
  const city = form.customerCity.trim();
  const address = form.customerAddress.trim();

  // İsim: en az 2 karakter, sadece rakamlardan oluşmasın
  const nameOk = name.length >= 2 && /[a-zA-ZçğıöşüÇĞİÖŞÜ]/.test(name);

  // Telefon: Türkiye cep numarası — 10, 11 veya 12 hane (ülke kodu dahil) olabilir
  const phoneOk = phoneDigits.length === 10 || phoneDigits.length === 11 || phoneDigits.length === 12;

  // İl + İlçe seçilmiş olmalı (StepContact bu alanı "İlçe, İl" formatında dolduruyor)
  const cityOk = city.length > 0;

  // Adres artık sadece sokak/cadde/bina no — il/ilçe ayrı seçildiği için eşik düşürüldü
  const addressOk = address.length >= 5;

  return nameOk && phoneOk && cityOk && addressOk;
}

function canProceed(step: number, form: FormData): boolean {
  if (step === 1) return !!form.photo;
  if (step === 2) return !!form.poolModel;
  if (step === 3) return !!form.poolSize;
  if (step === 5) return isContactValid(form);
  return true; // Adım 4 (özellikler) tamamen isteğe bağlı
}

interface Props { clientId?: string; isEmbed?: boolean; }

function BrandPanel({ step, steps, config }: { step: number; steps: StepDef[]; config: ClientConfig | null }) {
  const logoUrl = config?.brand?.logo_url || "/pools/havuzai-logo-şeffaf.png";
  const companyName = config?.brand?.company_name;
  const stepIndex = Math.max(0, steps.findIndex((s) => s.id === step));

  return (
    <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
      style={{ background: "linear-gradient(150deg, #0C1F3F 0%, #1A3560 60%, #0D2E52 100%)", minHeight: "100vh" }}>
      <div className="absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: `radial-gradient(circle at 1px 1px, #B8935A 1px, transparent 0)`, backgroundSize: "40px 40px" }} />
      <div className="absolute bottom-20 right-0 w-80 h-80 opacity-10"
        style={{ background: "radial-gradient(ellipse at center, #1D7BBF 0%, transparent 70%)", transform: "translate(30%, 10%)", animation: "poolWave 6s ease-in-out infinite" }} />
      <div className="absolute bottom-16 right-4 w-48 h-32 opacity-20 rounded-[40px]"
        style={{ background: "linear-gradient(135deg, #1D7BBF 0%, #2E9BD4 100%)", animation: "poolWave 4s ease-in-out infinite" }} />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <img src={logoUrl} alt={companyName || "HavuzAI"}
            style={{ height: "80px", width: "auto", objectFit: "contain", background: "white", borderRadius: "12px", padding: "8px 14px" }} />
        </div>
        {companyName && <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px" }}>{companyName}</p>}
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
        <div className="mb-6">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ background: "rgba(184,147,90,0.2)", color: "#D4AF7A", border: "1px solid rgba(184,147,90,0.3)" }}>
            Adım {stepIndex + 1} / {steps.length}
          </span>
        </div>
        <h2 className="font-display text-4xl font-bold leading-tight mb-6" style={{ color: "#FFFFFF" }}>
          {HEADLINES[step]}
        </h2>
        <div className="flex flex-col gap-3">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 transition-all duration-300"
              style={{ opacity: stepIndex === i ? 1 : stepIndex > i ? 0.5 : 0.3 }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 transition-all"
                style={{
                  background: stepIndex > i ? "rgba(5,150,105,0.2)" : stepIndex === i ? "rgba(184,147,90,0.2)" : "rgba(255,255,255,0.05)",
                  border: stepIndex > i ? "1px solid rgba(5,150,105,0.5)" : stepIndex === i ? "1px solid rgba(184,147,90,0.5)" : "1px solid rgba(255,255,255,0.1)",
                }}>
                {stepIndex > i
                  ? <span style={{ color: "#10B981", fontSize: "11px" }}>✓</span>
                  : <span style={{ color: stepIndex === i ? "#D4AF7A" : "rgba(255,255,255,0.3)", fontSize: "11px" }}>{i + 1}</span>}
              </div>
              <span className="text-sm font-medium" style={{ color: stepIndex === i ? "#FFFFFF" : "rgba(255,255,255,0.45)" }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-3">
        {[{ icon: "🔒", text: "Fotoğraflarınız güvende" }, { icon: "📞", text: "Ücretsiz teklif" }].map((b) => (
          <div key={b.text} className="flex items-center gap-2">
            <span className="text-sm">{b.icon}</span>
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{b.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileProgress({ step, steps, config }: { step: number; steps: StepDef[]; config: ClientConfig | null }) {
  const logoUrl = config?.brand?.logo_url || "/pools/favicon-logo-havuzai.png";
  const stepIndex = Math.max(0, steps.findIndex((s) => s.id === step));
  return (
    <div className="lg:hidden px-6 pt-6 pb-0">
      <div className="flex items-center justify-between mb-3">
        <img src={logoUrl} alt={config?.brand?.company_name || "HavuzAI"}
          style={{ height: "60px", width: "auto", objectFit: "contain", background: "white", borderRadius: "10px", padding: "6px 10px" }} />
        <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>{stepIndex + 1} / {steps.length}</span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${((stepIndex + 1) / steps.length) * 100}%`, background: "var(--gold)" }} />
      </div>
    </div>
  );
}

function AppForm({ clientId: propClientId, isEmbed }: Props) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const urlClientId  = searchParams.get("client");
  const clientId     = propClientId || urlClientId || null;

  const [step, setStep]           = useState(1);
  const [loading, setLoading]     = useState(false);
  const [config, setConfig]       = useState<ClientConfig | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({
    photo: null, poolModel: "", poolSize: "",
    gardenLength: "", gardenWidth: "",
    deckType: "", ceramicType: "",
    customerName: "", customerPhone: "", customerCity: "", customerAddress: "",
    hasWaterfall: false, hasStairs: false, stairType: "corner",
  });

  const updateForm = (data: Partial<FormData>) => setForm((prev) => ({ ...prev, ...data }));

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;
    setConfig(null);
    setConfigError(null);
    fetch(`/api/config?clientId=${encodeURIComponent(clientId)}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.success && d.config) setConfig(d.config);
        else setConfigError(d.error || "Konfigürasyon yüklenemedi.");
      })
      .catch(() => { if (!cancelled) setConfigError("Bağlantı hatası."); });
    return () => { cancelled = true; };
  }, [clientId]);

  // Seçili modelin kategorisine göre akış belirlenir.
  // Süs havuzu ("sus") ise: Fotoğraf -> Model -> İletişim (ölçü/özellik adımları yok).
  const selectedModel = config?.pool_models.find((m) => m.id === form.poolModel);
  const isOrnamental  = selectedModel?.category === "sus";
  const visibleSteps  = isOrnamental
    ? ALL_STEPS.filter((s) => ORNAMENTAL_STEP_IDS.includes(s.id))
    : ALL_STEPS;
  const stepIndex     = visibleSteps.findIndex((s) => s.id === step);

  const goNext = () => {
    const next = visibleSteps[stepIndex + 1];
    if (next) setStep(next.id);
  };

  const goBack = () => {
    const prev = visibleSteps[stepIndex - 1];
    if (prev) setStep(prev.id);
  };

  const handleSubmit = async () => {
    if (!canProceed(5, form)) { toast.error("Lütfen geçerli bir isim, telefon numarası, il/ilçe ve adres girin."); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("clientId",        clientId!);
      fd.append("photo",           form.photo!);
      fd.append("poolModel",       form.poolModel);
      fd.append("customerName",    form.customerName);
      fd.append("customerPhone",   form.customerPhone);
      fd.append("customerCity",    form.customerCity);
      fd.append("customerAddress", form.customerAddress);
      fd.append("source",          isEmbed ? "widget" : "direct");

      // Süs havuzunda ölçü/deck/seramik/şelale/merdiven adımları yok:
      // önceki seçimlerden kalmış olabilecek değerler gönderilmez, boş/false gider.
      fd.append("poolSize",    isOrnamental ? "" : form.poolSize);
      fd.append("deckType",    isOrnamental ? "" : form.deckType);
      fd.append("ceramicType", isOrnamental ? "" : form.ceramicType);
      fd.append("hasWaterfall", String(isOrnamental ? false : form.hasWaterfall));
      fd.append("hasStairs",    String(isOrnamental ? false : form.hasStairs));
      fd.append("stairType",    form.stairType);

      const res  = await fetch("/api/generate", { method: "POST", body: fd });
      const data = await res.json();

      if (data.success) {
        if (isEmbed) window.parent.postMessage("HAVUZAI_SUCCESS", "*");
        router.push(`/result/${data.orderId}?ai=${encodeURIComponent(data.aiPhoto)}&orig=${encodeURIComponent(data.original)}`);
      } else {
        toast.error(data.error || "Bir hata oluştu.");
        setLoading(false);
      }
    } catch {
      toast.error("Bağlantı hatası. Lütfen tekrar deneyin.");
      setLoading(false);
    }
  };

  if (!clientId) return (
    <div style={{ padding: 40, textAlign: "center", fontFamily: "sans-serif" }}>
      <h2 style={{ color: "#cc0000" }}>Geçersiz bağlantı</h2>
      <p>Bu sayfaya doğrudan erişilemez. Lütfen yetkili bir bayi bağlantısından giriş yapın.</p>
    </div>
  );

  if (configError) return (
    <div style={{ padding: 40, textAlign: "center", fontFamily: "sans-serif" }}>
      <h2 style={{ color: "#cc0000" }}>Form açılamadı</h2>
      <p>{configError}</p>
    </div>
  );

  if (loading || !config) return <LoadingScreen />;

  const brandColor = config.brand?.primary_color || "#1D7BBF";
  const isLastStep = step === 5;

  return (
    <div className="min-h-screen lg:grid"
      style={{ gridTemplateColumns: "420px 1fr", background: "var(--sand)", ["--pool" as string]: brandColor }}>
      <Toaster position="top-center" toastOptions={{ style: { fontFamily: "var(--font-jakarta), sans-serif", fontSize: "14px", borderRadius: "10px", background: "var(--navy)", color: "#fff" } }} />

      <BrandPanel step={step} steps={visibleSteps} config={config} />

      <div className="flex flex-col min-h-screen" style={{ background: "var(--sand)" }}>
        <MobileProgress step={step} steps={visibleSteps} config={config} />

        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full" style={{ maxWidth: "520px" }}>
            <div className="animate-fadeUp rounded-2xl overflow-hidden"
              style={{ background: "var(--white)", boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 12px 40px rgba(12,31,63,0.08)", border: "1px solid var(--border-soft)" }}>

              <div className="p-8">
                {step === 1 && <StepPhoto       form={form} update={updateForm} />}
                {step === 2 && <StepModel       form={form} update={updateForm} config={config} />}
                {step === 3 && <StepSize        form={form} update={updateForm} config={config} />}
                {step === 4 && <StepEnvironment form={form} update={updateForm} config={config} />}
                {step === 5 && <StepContact     form={form} update={updateForm} />}
              </div>

              <div className="px-8 pb-8 flex items-center justify-between gap-4">
                {stepIndex > 0 ? (
                  <button className="btn-secondary" onClick={goBack}>← Geri</button>
                ) : <div />}

                {!isLastStep ? (
                  <button className="btn-primary" onClick={() => {
                    if (!canProceed(step, form)) {
                      toast.error(step === 1 ? "Lütfen bir fotoğraf yükleyin." : "Lütfen bir seçim yapın.");
                      return;
                    }
                    goNext();
                  }}>İleri →</button>
                ) : (
                  <button className="btn-gold" onClick={handleSubmit}>✨ Görselimi Oluştur</button>
                )}
              </div>
            </div>

            <div className="hidden lg:flex justify-center gap-2 mt-6">
              {visibleSteps.map((s, i) => (
                <div key={s.id} className="rounded-full transition-all duration-300"
                  style={{ width: stepIndex === i ? "24px" : "8px", height: "8px", background: stepIndex === i ? "var(--gold)" : stepIndex > i ? "var(--gold-pale)" : "var(--border)" }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppPage(props: Props) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AppForm {...props} />
      <HowToUse tourKey="form" steps={FORM_GUIDE} />
    </Suspense>
  );
}
