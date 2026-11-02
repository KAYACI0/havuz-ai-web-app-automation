import PwaInstall from "@/components/PwaInstall";

// Bu dosya SADECE app/admin klasöründe zaten bir layout.tsx YOKSA kullanılır.
// Varsa içine yalnızca <PwaInstall /> satırını ve yukarıdaki import'u ekle.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <PwaInstall />
    </>
  );
}
