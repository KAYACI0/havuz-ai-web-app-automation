export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center"
      style={{
        background: "linear-gradient(150deg, #0C1F3F 0%, #1A3560 50%, #0D2E52 100%)",
      }}>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #B8935A 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Animated pool rings */}
      <div className="relative mb-10">
        {[0, 1, 2].map((i) => (
          <div key={i}
            className="absolute rounded-full border"
            style={{
              width:  `${(i + 1) * 64}px`,
              height: `${(i + 1) * 64}px`,
              borderColor: `rgba(29,123,191,${0.4 - i * 0.12})`,
              top:  `${-(i * 32)}px`,
              left: `${-(i * 32)}px`,
              animation: `ripple ${2 + i * 0.7}s ease-out infinite`,
              animationDelay: `${i * 0.6}s`,
            }}
          />
        ))}
        <div className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl animate-float"
          style={{
            background: "rgba(29,123,191,0.25)",
            border: "1px solid rgba(29,123,191,0.5)",
          }}>
          🏊
        </div>
      </div>

      <h2 className="font-display text-3xl font-bold text-white mb-3 relative z-10">
        Görseliniz hazırlanıyor
      </h2>
      <p className="text-sm relative z-10" style={{ color: "rgba(255,255,255,0.5)" }}>
        Yapay zeka havuzu bahçenize yerleştiriyor...
      </p>

      {/* Progress dots */}
      <div className="flex items-center gap-2 mt-8 relative z-10">
        {[0, 1, 2, 3].map((i) => (
          <div key={i}
            className="rounded-full"
            style={{
              width: "8px",
              height: "8px",
              background: "var(--gold)",
              animation: `ripple 1.4s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
              opacity: 0.8,
            }}
          />
        ))}
      </div>

      {/* ETA */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center relative z-10">
        <div className="px-5 py-2 rounded-full text-xs"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.4)",
          }}>
          Bu işlem ~15–20 saniye sürer
        </div>
      </div>
    </div>
  );
}
