"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import type { FormData } from "@/app/app/page";

interface Props { form: FormData; update: (d: Partial<FormData>) => void; }

export default function StepPhoto({ form, update }: Props) {
  const [rejectError, setRejectError] = useState<string | null>(null);

  const onDrop = useCallback(
    (files: File[]) => {
      if (files[0]) { setRejectError(null); update({ photo: files[0] }); }
    },
    [update]
  );

  const onDropRejected = useCallback((rejections: FileRejection[]) => {
    const code = rejections[0]?.errors[0]?.code;
    if (code === "file-too-large") {
      setRejectError("Fotoğraf 10 MB'tan büyük. Lütfen daha küçük bir dosya seçin.");
    } else if (code === "file-invalid-type") {
      setRejectError("Geçersiz dosya türü. Sadece JPG, PNG veya WEBP yükleyebilirsiniz.");
    } else {
      setRejectError("Fotoğraf yüklenemedi. Lütfen başka bir dosya deneyin.");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  // Object URL'i dosya başına bir kez oluştur, değişince eskisini temizle (bellek sızıntısını önler)
  const preview = useMemo(
    () => (form.photo ? URL.createObjectURL(form.photo) : null),
    [form.photo]
  );
  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest mb-1"
        style={{ color: "var(--gold)" }}>Adım 1</p>
      <h2 className="font-display text-2xl font-bold mb-1" style={{ color: "var(--navy)" }}>
        Evinizin fotoğrafı
      </h2>
      <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
        Bahçeyi gösteren bir fotoğraf yükleyin. AI, havuzu bu alana ekleyecek.
      </p>

      <div {...getRootProps()} style={{ outline: "none" }}>
        <input {...getInputProps()} />

        {preview ? (
          /* Preview state */
          <div className="relative rounded-xl overflow-hidden cursor-pointer group"
            style={{ border: "1.5px solid var(--border)" }}>
            <img src={preview} alt="Seçilen fotoğraf"
              className="w-full object-cover"
              style={{ maxHeight: "260px" }} />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "rgba(12,31,63,0.6)", backdropFilter: "blur(2px)" }}>
              <div className="text-center text-white">
                <div className="text-3xl mb-2">📷</div>
                <p className="text-sm font-semibold">Fotoğrafı değiştir</p>
              </div>
            </div>
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: "rgba(5,150,105,0.9)", color: "white" }}>
              ✓ Yüklendi
            </div>
            <div className="px-4 py-3 flex items-center gap-2"
              style={{ borderTop: "1px solid var(--border-soft)", background: "var(--surface)" }}>
              <span className="text-sm truncate flex-1" style={{ color: "var(--text-muted)" }}>
                {form.photo?.name}
              </span>
              <span className="text-xs shrink-0" style={{ color: "var(--text-faint)" }}>
                {form.photo ? (form.photo.size / 1024 / 1024).toFixed(1) + " MB" : ""}
              </span>
            </div>
          </div>
        ) : (
          /* Empty dropzone */
          <div className="rounded-xl flex flex-col items-center justify-center gap-4 py-12 cursor-pointer transition-all"
            style={{
              border: `2px dashed ${isDragActive ? "var(--pool)" : "var(--border)"}`,
              background: isDragActive ? "var(--pool-light)" : "var(--surface)",
            }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{
                background: isDragActive ? "rgba(29,123,191,0.15)" : "var(--sand)",
                border: `1px solid ${isDragActive ? "rgba(29,123,191,0.3)" : "var(--border)"}`,
                transition: "all 0.2s",
              }}>
              {isDragActive ? "📂" : "🖼️"}
            </div>
            <div className="text-center">
              <p className="font-semibold mb-1" style={{ color: isDragActive ? "var(--pool)" : "var(--navy)" }}>
                {isDragActive ? "Bırakın!" : "Fotoğrafı sürükleyin veya seçin"}
              </p>
              <p className="text-sm" style={{ color: "var(--text-faint)" }}>
                JPG, PNG, WEBP — Maks. 10 MB
              </p>
            </div>
            {!isDragActive && (
              <div className="px-5 py-2 rounded-lg text-sm font-medium"
                style={{ background: "var(--navy)", color: "white" }}>
                Dosya Seç
              </div>
            )}
          </div>
        )}
      </div>

      {rejectError && (
        <p className="text-sm mt-3 flex items-center gap-1.5" style={{ color: "var(--error)" }}>
          <span>⚠️</span> {rejectError}
        </p>
      )}
    </div>
  );
}
