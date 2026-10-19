import Script from "next/script";
import { BOOKING } from "@/lib/site";

/** Loads the cal.com embed once so booking links open in a modal. */
export function CalEmbed() {
  return (
    <Script id="cal-embed" strategy="lazyOnload">
      {`(function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if (typeof namespace === "string") { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ["initNamespace", namespace]); } else p(cal, ar); return; } p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
Cal("init", "${BOOKING.namespace}", { origin: "https://cal.com" });
Cal.ns["${BOOKING.namespace}"]("ui", { theme: "dark", hideEventTypeDetails: false, layout: "month_view", cssVarsPerTheme: { dark: { "cal-brand": "#ffffff" } } });`}
    </Script>
  );
}
