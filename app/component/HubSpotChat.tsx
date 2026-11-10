'use client';
// HubSpot live chat, shown INSIDE the Contact page (no floating bubble on other pages).
// Messages arrive in the UmrahConnect HubSpot inbox (account 149743238, EU data centre).
// HubSpot puts the chat into the element with id "hubspot-chat-inline".
import Script from 'next/script';

declare global {
  interface Window {
    hsConversationsSettings?: Record<string, unknown>;
  }
}

export default function HubSpotChat() {
  return (
    <>
      <style>{`
        #hubspot-chat-inline { width: 100%; max-width: 720px; margin: 0 auto 40px; }
        #hubspot-conversations-inline-iframe {
          width: 100%; height: 520px; border: 1px solid #E3E8EF; border-radius: 18px; background: #fff;
        }
      `}</style>
      <div id="hubspot-chat-inline" />
      {/* Must be set before the HubSpot script loads */}
      <Script id="hs-inline-settings" strategy="afterInteractive">
        {`window.hsConversationsSettings = { loadImmediately: true, inlineEmbedSelector: '#hubspot-chat-inline' };`}
      </Script>
      <Script id="hs-script-loader" src="https://js-eu1.hs-scripts.com/149743238.js" strategy="lazyOnload" />
    </>
  );
}
