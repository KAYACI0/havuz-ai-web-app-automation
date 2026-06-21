(function () {
  "use strict";

  // document.currentScript modern tarayıcılarda daha güvenilir
  var thisScript = document.currentScript || (function () {
    var s = document.getElementsByTagName("script");
    return s[s.length - 1];
  })();
  var clientId = thisScript.getAttribute("data-client") || "default";

  function init() {
    var style = document.createElement("style");
    style.textContent = [
      /* ── KEYFRAMES ─────────────────────────────────────────────
         Sadece transform + opacity: GPU composite, paint yok.
         Orijinaldeki box-shadow animasyonu her frame'de paint
         tetikliyordu — kaldırıldı.                              */
      "@keyframes havuzai-slideUp{from{transform:translateY(80px);opacity:0}to{transform:translateY(0);opacity:1}}",
      "@keyframes havuzai-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}",
      "@keyframes havuzai-tooltipIn{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:translateX(0)}}",
      "@keyframes havuzai-tooltipOut{from{opacity:1;transform:translateX(0)}to{opacity:0;transform:translateX(10px)}}",
      "@keyframes havuzai-modalIn{from{transform:translateY(60px);opacity:0}to{transform:translateY(0);opacity:1}}",
      "@keyframes havuzai-modalOut{from{transform:translateY(0);opacity:1}to{transform:translateY(-50px);opacity:0}}",
      "@keyframes havuzai-overlayIn{from{opacity:0}to{opacity:1}}",
      "@keyframes havuzai-overlayOut{from{opacity:1}to{opacity:0}}",

      /* ── BUTON ──────────────────────────────────────────────── */
      "#havuzai-btn{",
      "position:fixed;bottom:30px;right:30px;",
      "width:72px;height:72px;border-radius:50%;border:none;",
      "background:linear-gradient(145deg,#0077e6,#00c2ff);",
      "color:#fff;cursor:pointer;z-index:9998;",
      "display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;",
      "box-shadow:0 4px 20px rgba(0,102,204,.45),0 2px 8px rgba(255,255,255,.3);",
      "font-family:-apple-system,BlinkMacSystemFont,sans-serif;",
      /* will-change: kendi GPU katmanına alır, sayfa repaint'ini engeller */
      "opacity:0;will-change:transform;",
      "animation:havuzai-slideUp .5s ease .5s forwards, havuzai-pulse 2.4s ease-in-out 1.2s infinite;",
      "transition:transform .2s,box-shadow .2s;}",

      /* Kullanıcı bir kez tıklayınca sonsuz pulse durur */
      "#havuzai-btn.havuzai-used{animation:none;}",

      "#havuzai-btn:hover{",
      "transform:scale(1.12) !important;",
      "box-shadow:0 10px 36px rgba(0,102,204,.65),0 4px 12px rgba(255,255,255,.25) !important;}",

      "#havuzai-btn-emoji{font-size:26px;line-height:1;pointer-events:none;}",
      "#havuzai-btn-label{font-size:9px;font-weight:700;letter-spacing:.4px;pointer-events:none;",
      "text-transform:uppercase;opacity:.92;}",

      /* ── TOOLTIP ────────────────────────────────────────────── */
      "#havuzai-tooltip{",
      "position:fixed;bottom:46px;right:116px;",
      "background:#fff;color:#0055bb;",
      "font-size:12px;font-weight:600;padding:8px 14px;border-radius:20px;",
      "white-space:nowrap;pointer-events:none;z-index:9999;",
      "box-shadow:0 4px 18px rgba(0,102,204,.25);",
      "font-family:-apple-system,BlinkMacSystemFont,sans-serif;",
      "animation:havuzai-tooltipIn .35s ease .9s both;}",
      "#havuzai-tooltip::after{content:'';position:absolute;top:50%;right:-7px;",
      "transform:translateY(-50%);border:7px solid transparent;",
      "border-right:none;border-left-color:#fff;}",
      "#havuzai-tooltip.hide{animation:havuzai-tooltipOut .3s ease forwards;}",

      /* ── OVERLAY ────────────────────────────────────────────── */
      "#havuzai-overlay{",
      "display:none;position:fixed;top:0;left:0;width:100%;height:100%;",
      /* backdrop-filter:blur kaldırıldı — her frame'de tüm
         arkaplanı yeniden hesapladığı için çok pahalıydı.       */
      "background:rgba(0,0,0,.55);z-index:9999;}",
      "#havuzai-overlay.is-open{display:block;animation:havuzai-overlayIn .3s ease forwards;}",
      "#havuzai-overlay.is-closing{animation:havuzai-overlayOut .3s ease forwards;}",

      /* ── MODAL ──────────────────────────────────────────────── */
      "#havuzai-modal{",
      "position:absolute;bottom:0;left:50%;transform:translateX(-50%);",
      "width:90%;max-width:520px;height:88vh;border-radius:24px 24px 0 0;overflow:hidden;",
      /* will-change: modal animasyonunu GPU'ya taşır           */
      "will-change:transform,opacity;",
      "box-shadow:0 -8px 48px rgba(0,0,0,.35);}",
      "#havuzai-overlay.is-open #havuzai-modal{animation:havuzai-modalIn .4s cubic-bezier(.22,.9,.36,1) forwards;}",
      "#havuzai-overlay.is-closing #havuzai-modal{animation:havuzai-modalOut .3s ease forwards;}",

      "#havuzai-iframe{width:100%;height:100%;border:none;}",

      /* ── KAPAT BUTONU ───────────────────────────────────────── */
      "#havuzai-close{",
      "position:absolute;top:14px;right:14px;",
      "background:rgba(255,255,255,.92);border:none;",
      "width:34px;height:34px;border-radius:50%;font-size:18px;",
      "cursor:pointer;display:flex;align-items:center;justify-content:center;",
      "z-index:10000;box-shadow:0 2px 8px rgba(0,0,0,.15);",
      "transition:background .2s,transform .2s;}",
      "#havuzai-close:hover{background:#fff;transform:scale(1.1);}"
    ].join("");
    document.head.appendChild(style);

    /* ── BUTON ────────────────────────────────────────────────── */
    var btn = document.createElement("button");
    btn.id = "havuzai-btn";
    btn.setAttribute("aria-label", "HavuzAI – Havuzunu Tasarla");

    var emoji = document.createElement("span");
    emoji.id          = "havuzai-btn-emoji";
    emoji.textContent = "🏊";

    var label = document.createElement("span");
    label.id          = "havuzai-btn-label";
    label.textContent = "Tasarla";

    btn.appendChild(emoji);
    btn.appendChild(label);

    /* ── TOOLTIP ──────────────────────────────────────────────── */
    var tooltip = document.createElement("div");
    tooltip.id          = "havuzai-tooltip";
    tooltip.textContent = "Havuzunuzu görün! 🏊";

    /* ── OVERLAY + MODAL ──────────────────────────────────────── */
    var overlay  = document.createElement("div");
    overlay.id   = "havuzai-overlay";

    var modal    = document.createElement("div");
    modal.id     = "havuzai-modal";

    /* ── İFRAME — LAZY ────────────────────────────────────────── *
     * src burada SET EDİLMİYOR. Kullanıcı butona basana kadar     *
     * iframe içindeki uygulama hiç yüklenmez. Bu en kritik        *
     * optimizasyondur: sayfanın ilk yükünde network isteği yok.   */
    var iframe     = document.createElement("iframe");
    iframe.id      = "havuzai-iframe";
    iframe.title   = "HavuzAI";
    iframe.setAttribute("loading", "lazy");
    iframe.setAttribute("allow",   "fullscreen");

    var closeBtn          = document.createElement("button");
    closeBtn.id           = "havuzai-close";
    closeBtn.textContent  = "✕";

    modal.appendChild(closeBtn);
    modal.appendChild(iframe);
    overlay.appendChild(modal);

    /* DocumentFragment: tek seferde DOM'a eklenir, 3 ayrı reflow yok */
    var frag = document.createDocumentFragment();
    frag.appendChild(btn);
    frag.appendChild(tooltip);
    frag.appendChild(overlay);
    document.body.appendChild(frag);

    /* ── TOOLTIP 3 SANİYE SONRA KAYBOLSUN ────────────────────── */
    setTimeout(function () {
      tooltip.classList.add("hide");
      setTimeout(function () { tooltip.style.display = "none"; }, 320);
    }, 4000);

    /* ── IFRAME LAZY LOAD ─────────────────────────────────────── */
    var iframeLoaded = false;
    function loadIframe() {
      if (iframeLoaded) return;
      iframe.src   = "https://havuz-ai-web-app-automation.vercel.app/embed?client=" + clientId;
      iframeLoaded = true;
    }

    /* ── MODAL AÇMA / KAPAMA ──────────────────────────────────── */
    function openModal() {
      loadIframe();                          // ilk açılışta src set edilir
      btn.classList.add("havuzai-used");     // sonsuz pulse durur
      overlay.style.display = "block";
      void overlay.offsetWidth;             // reflow — animasyon için zorunlu
      overlay.classList.add("is-open");
      overlay.classList.remove("is-closing");
    }

    function closeModal() {
      overlay.classList.add("is-closing");
      overlay.classList.remove("is-open");
      overlay.addEventListener("animationend", function onEnd() {
        overlay.style.display = "none";
        overlay.classList.remove("is-closing");
        overlay.removeEventListener("animationend", onEnd);
      });
    }

    btn.addEventListener("click", openModal);
    closeBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeModal();
    });

    window.addEventListener("message", function (e) {
      if (e.data === "HAVUZAI_CLOSE" || e.data === "HAVUZAI_SUCCESS") closeModal();
    });
  }

  /* ── SAYFA RENDER'INI BLOKLAMADAN BAŞLA ──────────────────────── *
   * requestIdleCallback: tarayıcı boşta olduğunda çalışır.         *
   * DOMContentLoaded beklenir, sonra idle slot'ta init çağrılır.    *
   * Eski tarayıcılar için 300ms setTimeout fallback vardır.         */
  function scheduleInit() {
    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(init, { timeout: 2000 });
    } else {
      setTimeout(init, 300);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleInit);
  } else {
    scheduleInit();
  }
})();
