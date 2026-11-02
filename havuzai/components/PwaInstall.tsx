"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "havuzai-pwa-dismissed";

/**
 * Bayi paneli (/admin/<bayi>) için "uygulama olarak kur" desteği.
 * - Sadece /admin/... sayfalarında çalışır; müşteri formu ve widget etkilenmez.
 * - Manifest ve iPhone ikon etiketlerini sayfaya ekler.
 * - Android'de "Yükle" butonu, iPhone'da "Ana Ekrana Ekle" açıklaması gösterir.
 */
export default function PwaInstall() {
  const pathname = usePathname();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(true); // mount olana kadar gizli
  const [showIosHelp, setShowIosHelp] = useState(false);

  const clientId = pathname?.startsWith("/admin/") ? pathname.split("/")[2] : null;

  // Manifest + iOS etiketleri
  useEffect(() => {
    if (!clientId) return;

    const added: HTMLElement[] = [];
    const add = (tag: "link" | "meta", attrs: Record<string, string>) => {
      const el = document.createElement(tag);
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      document.head.appendChild(el);
      added.push(el);
    };

    add("link", { rel: "manifest", href: `/api/pwa/manifest?c=${encodeURIComponent(clientId)}` });
    add("link", { rel: "apple-touch-icon", href: "/icons/apple-touch-icon.png" });
    add("meta", { name: "apple-mobile-web-app-capable", content: "yes" });
    add("meta", { name: "mobile-web-app-capable", content: "yes" });
    add("meta", { name: "apple-mobile-web-app-title", content: "HavuzAI" });
    add("meta", { name: "theme-color", content: "#0C1F3F" });

    return () => added.forEach((el) => el.remove());
  }, [clientId]);

  // Kurulum durumu ve tarayıcı olayları
  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    setInstalled(standalone);
    setIsIos(/iphone|ipad|ipod/i.test(navigator.userAgent));

    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }

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
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  };

  // Admin sayfası değilse, zaten kuruluysa, kapatıldıysa ya da kurulamayan tarayıcıdaysa gösterme
  if (!clientId || installed || dismissed) return null;
  if (!deferred && !isIos) return null;

  const btn: React.CSSProperties = {
    border: "none",
    borderRadius: "10px",
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  };

  return (
    <div
      style={{
        position: "fixed",
        left: "16px",
        right: "16px",
        bottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
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
      <p style={{ fontSize: "14px", fontWeight: 600, marginBottom: "10px" }}>
        📲 HavuzAI Panel&apos;i telefonuna uygulama olarak kur
      </p>

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
