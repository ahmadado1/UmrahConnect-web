import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UmrahConnect — Your complete Umrah companion",
  description: "Prayer times, Quran reader, Umrah guide, hotel bookings and more for pilgrims.",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
  verification: {
    google: "9Jzg0F7vqT2af0-aIj9gnRqodMnUgEb6LrZfKOyP__Q",
  },
  other: {
    "impact-site-verification": "c5a20aef-c37d-489b-9dab-f373f75a0e04",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Script id="tp-em" strategy="afterInteractive">
          {`(function () {
      var script = document.createElement("script");
      script.async = 1;
      script.setAttribute("data-cmp-ab","2");
      script.src = "https://tp-em.com/NTgzMTQ1.js?t=583145";
      document.head.appendChild(script);
  })();`}
        </Script>
      </body>
    </html>
  );
}
