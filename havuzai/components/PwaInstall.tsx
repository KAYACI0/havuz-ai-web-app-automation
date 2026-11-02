"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Kind = "panel" | "form";
interface Target {
  kind: Kind;
  clientId: string;
}

const DISMISS_KEY = "havuzai-pwa-dismissed";

// Manifest adresine ve start_url'e sadece güvenli karakterler girsin.
const cleanId = (v: string | null | undefined) =>
  (v || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);

/**
 * "Uygulama olarak kur" desteği. İki yerde çalışır:
 *  - /admin/<bayi>      → bayi paneli uygulaması
 *  - /app?client=<bayi> → müşteri formu uygulaması (fotoğraf yükle, görsel oluştur)
 * Başka sayfalarda (örn. /embed widget'ı, sonuç sayfası) hiçbir şey yapmaz.
 * Manifest ve iPhone ikon etiketlerini sayfaya ekler; Android'de "Yükle" butonu,
 * iPhone'da "Ana Ekrana Ekle" açıklaması gösterir.
 */
export default function PwaInstall() {
  const pathname = usePathname();
  const [target, setTarget] = useState<Target | null>(null);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(true); // belirlenene kadar gizli
  const [showIosHelp, setShowIosHelp] = useState(false);

  // Bu sayfa hangi uygulamaya ait?
  useEffect(() => {
    let next: Target | null = null;
    if (pathname?.startsWith("/admin/")) {
      const id = cleanId(pathname.split("/")[2]);
      if (id) next = { kind: "panel", clientId: id };
    } else if (pathname === "/app") {
      const id = cleanId(new URLSearchParams(window.location.search).get("client"));
      if (id) next = { kind: "form", clientId: id };
    }
    setTarget(next);

    if (next) {
      try {
        setDismissed(localStorage.getItem(`${DISMISS_KEY}-${next.kind}`) === "1");
      } catch {
        setDismissed(false);
      }
    }
  }, [pathname]);

  // Manifest + iOS etiketleri
  const kind = target?.kind;
  const clientId = target?.clientId;
  useEffect(() => {
    if (!kind || !clientId) return;

    const added: HTMLElement[] = [];
    const add = (tag: "link" | "meta", attrs: Record<string, string>) => {
      const el = document.createElement(tag);
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      document.head.appendChild(el);
      added.push(el);
    };

    add("link", {
      rel: "manifest",
      href: `/api/pwa/manifest?c=${encodeURIComponent(clientId)}&k=${kind}`,
    });
    add("link", { rel: "apple-touch-icon", href: "/icons/apple-touch-icon.png" });
    add("meta", { name: "apple-mobile-web-app-capable", content: "yes" });
    add("meta", { name: "mobile-web-app-capable", content: "yes" });
    add("meta", { name: "apple-mobile-web-app-title", content: "HavuzAI" });

    return () => added.forEach((el) => el.remove());
  }, [kind, clientId]);

  // Kurulum durumu ve tarayıcı olayları
  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    setInstalled(standalone);
    setIsIos(/iphone|ipad|ipod/i.test(navigator.userAgent));

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  };

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(`${DISMISS_KEY}-${kind}`, "1");
    } catch {}
  };

  // Uygun sayfa değilse, zaten kuruluysa, kapatıldıysa ya da kurulamayan tarayıcıdaysa gösterme
  if (!target || installed || dismissed) return null;
  if (!deferred && !isIos) return null;

  const title =
    target.kind === "panel"
      ? "📲 HavuzAI Panel'i telefonuna uygulama olarak kur"
      : "📲 Uygulamayı telefonuna kur, bahçeni istediğin an dene";

  const btn: React.CSSProperties = {
    border: "none",
    borderRadius: "10px",
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  };

  // Sağ altta yardım (?) butonu ve altta İleri butonları olduğu için bant üstte durur.
  return (
    <div
      style={{
        position: "fixed",
        left: "16px",
        right: "16px",
        top: "calc(16px + env(safe-area-inset-top, 0px))",
        zIndex: 50,
        background: "#0C1F3F",
        color: "#fff",
        borderRadius: "16px",
        padding: "14px 16px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        maxWidth: "480px",
        margin: "0 auto",
      }}
    >
      <p style={{ fontSize: "14px", fontWeight: 600, marginBottom: "10px" }}>{title}</p>

      {isIos && !deferred && showIosHelp && (
        <p style={{ fontSize: "13px", opacity: 0.8, marginBottom: "10px", lineHeight: 1.5 }}>
          Safari&apos;de alttaki <b>Paylaş</b> (yukarı oklu kare) butonuna dokun, sonra
          <b> Ana Ekrana Ekle</b>&apos;yi seç. Chrome&apos;da değil, Safari&apos;de açman gerekir.
        </p>
      )}

      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
        <button onClick={dismiss} style={{ ...btn, background: "rgba(255,255,255,0.12)", color: "#fff" }}>
          Sonra
        </button>
        {deferred ? (
          <button onClick={install} style={{ ...btn, background: "#B8935A", color: "#fff" }}>
            Yükle
          </button>
        ) : (
          <button onClick={() => setShowIosHelp((v) => !v)} style={{ ...btn, background: "#B8935A", color: "#fff" }}>
            Nasıl kurulur?
          </button>
        )}
      </div>
    </div>
  );
}
