"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import StepPhoto from "@/components/steps/StepPhoto";
import StepModel from "@/components/steps/StepModel";
import StepSize from "@/components/steps/StepSize";
import StepEnvironment from "@/components/steps/StepEnvironment";
import StepContact from "@/components/steps/StepContact";
import LoadingScreen from "@/components/LoadingScreen";
import HowToUse from "@/components/HowToUse";

const FORM_GUIDE = [
  {
    icon: "📷",
    title: "Fotoğraf Yükleyin",
    desc: "Bahçenizi veya arka bahçenizi net şekilde gösteren bir fotoğraf seçin. Fotoğrafı sürükleyip bırakabilir ya da 'Dosya Seç' butonuna tıklayabilirsiniz.",
  },
  {
    icon: "🏊",
    title: "Havuz Modelini Seçin",
    desc: "RELAX modeli organik oval hatlarıyla aile kullanımına uygundur. ROMA modeli dikdörtgen klasik tasarımıyla modern villaları tamamlar.",
  },
  {
    icon: "📐",
    title: "Ölçü Belirleyin",
    desc: "Bahçenizin büyüklüğüne uygun havuz boyutunu seçin. Her kartın üzerinde boyuta orantılı küçük bir görsel yer almaktadır.",
  },
  {
    icon: "🌿",
    title: "Çevre Tasarımını Ayarlayın",
    desc: "Havuzun etrafındaki deck (ahşap zemin) rengini ve havuz içi seramik rengini seçin. Bu seçimler AI görselini doğrudan etkiler.",
  },
  {
    icon: "👤",
    title: "Bilgilerinizi Girin",
    desc: "Ad, telefon ve adres bilgilerinizi girerek 'Görselimi Oluştur' butonuna tıklayın. AI ~15 saniye içinde havuzu bahçenize yerleştirir ve uzmanlarımız sizinle iletişime geçer.",
  },
];

export interface FormData {
  photo:           File | null;
  poolModel:       string;
  poolSize:        string;
  deckType:        string;
  ceramicType:     string;
  customerName:    string;
  customerPhone:   string;
  customerAddress: string;
  hasWaterfall:    boolean;
  stairType:       "corner" | "wide";
}

const STEPS = [
  { n: 1, label: "Fotoğraf",  icon: "📷" },
  { n: 2, label: "Model",     icon: "🏊" },
  { n: 3, label: "Ölçü",      icon: "📐" },
  { n: 4, label: "Çevre",     icon: "🌿" },
  { n: 5, label: "İletişim",  icon: "👤" },
];

function canProceed(step: number, form: FormData): boolean {
  if (step === 1) return !!form.photo;
  if (step === 2) return !!form.poolModel;
  if (step === 3) return !!form.poolSize;
  if (step === 5) return !!(form.customerName && form.customerPhone && form.customerAddress);
  return true;
}

interface Props { clientId?: string; isEmbed?: boolean; }

/* ── Left decorative panel ── */
function BrandPanel({ step }: { step: number }) {
  const headlines = [
    "Hayalinizdeki havuzu evinizde görün.",
    "Hangi model size uygun?",
    "Doğru ölçü, mükemmel uyum.",
    "Çevre tasarımınızı kişiselleştirin.",
    "Son adım — teklif hemen hazır.",
  ];

  return (
    <div
      className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
      style={{
        background: "linear-gradient(150deg, #0C1F3F 0%, #1A3560 60%, #0D2E52 100%)",
        minHeight: "100vh",
      }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #B8935A 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Decorative pool shape */}
      <div className="absolute bottom-20 right-0 w-80 h-80 opacity-10"
        style={{
          background: "radial-gradient(ellipse at center, #1D7BBF 0%, transparent 70%)",
          transform: "translate(30%, 10%)",
          animation: "poolWave 6s ease-in-out infinite",
        }}
      />
      <div className="absolute bottom-16 right-4 w-48 h-32 opacity-20 rounded-[40px]"
        style={{
          background: "linear-gradient(135deg, #1D7BBF 0%, #2E9BD4 100%)",
          animation: "poolWave 4s ease-in-out infinite",
        }}
      />

      {/* Logo */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <img
            src="/pools/havuzai-logo-şeffaf.png"
            alt="HavuzAI"
            style={{
              height: "80px", width: "auto", objectFit: "contain",
              background: "white", borderRadius: "12px", padding: "8px 14px",
            }}
          />
        </div>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px" }}>
          havuzai.com.tr
        </p>
      </div>

      {/* Center content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
        <div className="mb-6">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ background: "rgba(184,147,90,0.2)", color: "#D4AF7A", border: "1px solid rgba(184,147,90,0.3)" }}>
            Adım {step} / 5
          </span>
        </div>

        <h2 className="font-display text-4xl font-bold leading-tight mb-6"
          style={{ color: "#FFFFFF" }}>
          {headlines[step - 1]}
        </h2>

        <div className="flex flex-col gap-3">
          {STEPS.map((s) => (
            <div key={s.n}
              className="flex items-center gap-3 transition-all duration-300"
              style={{ opacity: step === s.n ? 1 : step > s.n ? 0.5 : 0.3 }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 transition-all"
                style={{
                  background: step > s.n
                    ? "rgba(5,150,105,0.2)"
                    : step === s.n
                    ? "rgba(184,147,90,0.2)"
                    : "rgba(255,255,255,0.05)",
                  border: step > s.n
                    ? "1px solid rgba(5,150,105,0.5)"
                    : step === s.n
                    ? "1px solid rgba(184,147,90,0.5)"
                    : "1px solid rgba(255,255,255,0.1)",
                }}>
                {step > s.n
                  ? <span style={{ color: "#10B981", fontSize: "11px" }}>✓</span>
                  : <span style={{ color: step === s.n ? "#D4AF7A" : "rgba(255,255,255,0.3)", fontSize: "11px" }}>
                      {s.n}
                    </span>
                }
              </div>
              <span className="text-sm font-medium"
                style={{ color: step === s.n ? "#FFFFFF" : "rgba(255,255,255,0.45)" }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom trust badges */}
      <div className="relative z-10 flex flex-col gap-3">
        {[
          { icon: "⚡", text: "~15 saniyede sonuç" },
          { icon: "🔒", text: "Fotoğraflarınız güvende" },
          { icon: "📞", text: "Ücretsiz teklif" },
        ].map((b) => (
          <div key={b.text} className="flex items-center gap-2">
            <span className="text-sm">{b.icon}</span>
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{b.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Progress bar (mobile) ── */
function MobileProgress({ step }: { step: number }) {
  return (
    <div className="lg:hidden px-6 pt-6 pb-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <img
            src="/pools/favicon-logo-havuzai.png"
            alt="HavuzAI"
            style={{
              height: "60px", width: "auto", objectFit: "contain",
              background: "white", borderRadius: "10px", padding: "6px 10px",
            }}
          />
        </div>
        <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
          {step} / 5
        </span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${(step / 5) * 100}%`, background: "var(--gold)" }} />
      </div>
    </div>
  );
}

function AppForm({ clientId: propClientId, isEmbed }: Props) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const clientId     = propClientId || searchParams.get("client") || "";

  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState<FormData>({
    photo: null, poolModel: "", poolSize: "",
    deckType: "", ceramicType: "",
    customerName: "", customerPhone: "", customerAddress: "",
    hasWaterfall: false, stairType: "corner",
  });

  const updateForm = (data: Partial<FormData>) =>
    setForm((prev) => ({ ...prev, ...data }));

  const handleSubmit = async () => {
    if (!canProceed(5, form)) {
      toast.error("Lütfen tüm alanları doldurun.");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("clientId",        clientId);
      fd.append("photo",           form.photo!);
      fd.append("poolModel",       form.poolModel);
      fd.append("poolSize",        form.poolSize);
      fd.append("deckType",        form.deckType);
      fd.append("ceramicType",     form.ceramicType);
      fd.append("customerName",    form.customerName);
      fd.append("customerPhone",   form.customerPhone);
      fd.append("customerAddress", form.customerAddress);
      fd.append("hasWaterfall",    String(form.hasWaterfall));
      fd.append("stairType",       form.stairType);
      fd.append("source",          isEmbed ? "widget" : "direct");

      const res  = await fetch("/api/generate", { method: "POST", body: fd });
      const data = await res.json();

      if (data.success) {
        if (isEmbed) window.parent.postMessage("HAVUZAI_SUCCESS", "*");
        router.push(
          `/result/${data.orderId}?ai=${encodeURIComponent(data.aiPhoto)}&orig=${encodeURIComponent(data.original)}`
        );
      } else {
        toast.error(data.error || "Bir hata oluştu.");
        setLoading(false);
      }
    } catch {
      toast.error("Bağlantı hatası. Lütfen tekrar deneyin.");
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen lg:grid" style={{ gridTemplateColumns: "420px 1fr", background: "var(--sand)" }}>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: "var(--font-jakarta), sans-serif",
            fontSize: "14px",
            borderRadius: "10px",
            background: "var(--navy)",
            color: "#fff",
          },
        }}
      />

      {/* Left brand panel */}
      <BrandPanel step={step} />

      {/* Right form area */}
      <div className="flex flex-col min-h-screen" style={{ background: "var(--sand)" }}>
        <MobileProgress step={step} />

        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full" style={{ maxWidth: "520px" }}>

            {/* Form card */}
            <div className="animate-fadeUp rounded-2xl overflow-hidden"
              style={{
                background: "var(--white)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 12px 40px rgba(12,31,63,0.08)",
                border: "1px solid var(--border-soft)",
              }}>

              {/* Step content */}
              <div className="p-8">
                {step === 1 && <StepPhoto       form={form} update={updateForm} />}
                {step === 2 && <StepModel       form={form} update={updateForm} />}
                {step === 3 && <StepSize        form={form} update={updateForm} />}
                {step === 4 && <StepEnvironment form={form} update={updateForm} />}
                {step === 5 && <StepContact     form={form} update={updateForm} />}
              </div>

              {/* Navigation footer */}
              <div className="px-8 pb-8 flex items-center justify-between gap-4">
                {step > 1 ? (
                  <button className="btn-secondary" onClick={() => setStep((s) => s - 1)}>
                    ← Geri
                  </button>
                ) : (
                  <div />
                )}

                {step < 5 ? (
                  <button
                    className="btn-primary"
                    onClick={() => {
                      if (!canProceed(step, form)) {
                        toast.error(step === 1 ? "Lütfen bir fotoğraf yükleyin." : "Lütfen bir seçim yapın.");
                        return;
                      }
                      setStep((s) => s + 1);
                    }}
                  >
                    İleri →
                  </button>
                ) : (
                  <button className="btn-gold" onClick={handleSubmit}>
                    ✨ Görselimi Oluştur
                  </button>
                )}
              </div>
            </div>

            {/* Step dots (desktop bottom) */}
            <div className="hidden lg:flex justify-center gap-2 mt-6">
              {STEPS.map((s) => (
                <div key={s.n}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width:   step === s.n ? "24px" : "8px",
                    height:  "8px",
                    background: step === s.n
                      ? "var(--gold)"
                      : step > s.n
                      ? "var(--gold-pale)"
                      : "var(--border)",
                  }}
                />
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
