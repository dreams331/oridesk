/**
 * OriDesk Chat Widget — Embed Script
 * Served at /widget.js via Next.js route handler.
 *
 * Usage:
 * <script src="https://yourdomain.com/widget.js" data-widget-key="YOUR_KEY" defer></script>
 */

(function () {
  const script = document.currentScript || (function () {
    const scripts = document.getElementsByTagName("script");
    return scripts[scripts.length - 1];
  })();

  const widgetKey = script.getAttribute("data-widget-key");
  if (!widgetKey) {
    console.warn("[OriDesk] No data-widget-key found on script tag.");
    return;
  }

  // Derive base URL from the script src
  const scriptSrc = script.getAttribute("src") || "";
  const baseUrl = scriptSrc.replace("/widget.js", "");

  // Inject iframe styles
  const style = document.createElement("style");
  style.textContent = `
    #oridesk-widget-iframe {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 380px;
      height: 560px;
      border: none;
      z-index: 2147483647;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
      background: transparent;
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    @media (max-width: 480px) {
      #oridesk-widget-iframe {
        width: 100%;
        height: 100%;
        bottom: 0;
        right: 0;
        border-radius: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // Create and inject the iframe
  const iframe = document.createElement("iframe");
  iframe.id = "oridesk-widget-iframe";
  iframe.src = `${baseUrl}/widget?key=${encodeURIComponent(widgetKey)}`;
  iframe.setAttribute("title", "OriDesk Support Chat");
  iframe.setAttribute("allow", "");
  document.body.appendChild(iframe);
})();
