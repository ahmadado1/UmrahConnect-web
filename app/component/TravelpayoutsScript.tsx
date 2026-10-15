"use client"

import Script from "next/script"
import { usePathname } from "next/navigation"

const SNIPPET = `(function () {
      var script = document.createElement("script");
      script.async = 1;
      script.setAttribute("data-cmp-ab","2");
      script.src = "https://tp-em.com/NTgzMTQ1.js?t=583145";
      document.head.appendChild(script);
  })();`

export default function TravelpayoutsScript() {
  const pathname = usePathname() || ""
  if (pathname.startsWith("/agents") || pathname.startsWith("/admin")) return null

  return (
    <Script id="tp-em" strategy="afterInteractive">
      {SNIPPET}
    </Script>
  )
}
