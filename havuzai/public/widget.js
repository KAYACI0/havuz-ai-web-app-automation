(function () {
  "use strict";

  // Eğer widget zaten yüklenmişse tekrar yükleme
  if (window.__havuzaiLoaded) return;
  window.__havuzaiLoaded = true;

  var scripts = document.getElementsByTagName("script");
  var thisScript = scripts[scripts.length - 1];
  var clientId = thisScript.getAttribute("data-client") || "default";

  function init() {
    // Buton oluştur
    var btn = document.createElement("button");
    btn.id = "havuzai-btn";
    btn.innerHTML = "🏊 Havuzunu Tasarla";
    btn.style.cssText = [
      "position:fixed;bottom:30px;right:30px;",
      "background:linear-gradient(135deg,#0066cc,#00aaff);",
      "color:white;border:none;padding:14px 22px;",
      "border-radius:50px;font-size:15px;font-weight:700;",
      "cursor:pointer;box-shadow:0 4px 20px rgba(0,102,204,0.4);",
      "z-index:999998;font-family:sans-serif;"
    ].join("");

    var overlay = document.createElement("div");
    overlay.id = "havuzai-overlay";
    overlay.style.cssText = [
      "display:none;position:fixed;top:0;left:0;",
      "width:100%;height:100%;background:rgba(0,0,0,0.6);",
      "z-index:999999;"
    ].join("");

    var modal = document.createElement("div");
    modal.style.cssText = [
      "position:absolute;top:50%;left:50%;",
      "transform:translate(-50%,-50%);",
      "width:90%;max-width:520px;height:85vh;",
      "border-radius:20px;overflow:hidden;background:white;"
    ].join("");

    var iframe = document.createElement("iframe");
    iframe.id = "havuzai-iframe";
    iframe.style.cssText = "width:100%;height:100%;border:none;";

    var closeBtn = document.createElement("button");
    closeBtn.innerHTML = "✕";
    closeBtn.style.cssText = [
      "position:absolute;top:15px;right:15px;",
      "background:rgba(255,255,255,0.9);border:none;",
      "width:36px;height:36px;border-radius:50%;",
      "font-size:20px;cursor:pointer;z-index:1000000;"
    ].join("");

    modal.appendChild(closeBtn);
    modal.appendChild(iframe);
    overlay.appendChild(modal);
    document.body.appendChild(btn);
    document.body.appendChild(overlay);

    // Her tıklamada iframe yeniden yüklenir — form sıfırlanır
    btn.addEventListener("click", function () {
      iframe.src = "https://havuz-ai-web-app-automation.vercel.app/embed?client=" + clientId + "&t=" + Date.now();
      overlay.style.display = "block";
    });

    closeBtn.addEventListener("click", function () {
      overlay.style.display = "none";
    });

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) {
        overlay.style.display = "none";
      }
    });

    // SUCCESS mesajında modal kapanmaz, sadece CLOSE'da kapanır
    window.addEventListener("message", function (e) {
      if (e.data === "HAVUZAI_CLOSE") {
        overlay.style.display = "none";
      }
    });
  }

  // DOM hazır değilse bekle
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
