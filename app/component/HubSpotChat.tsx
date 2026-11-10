// HubSpot website chat (and HubSpot visitor tracking) on every page.
// Messages from the chat bubble arrive in the UmrahConnect HubSpot inbox (account 149743238, EU).
// Loaded after the page is interactive so it never slows down the first view.
import Script from "next/script"

export default function HubSpotChat() {
  return (
    <Script
      id="hs-script-loader"
      src="https://js-eu1.hs-scripts.com/149743238.js"
      strategy="afterInteractive"
    />
  )
}
