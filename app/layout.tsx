import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies, headers } from "next/headers";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { isRtl, resolveLang } from "@/lib/i18n/languages";
import TravelpayoutsScript from "./component/TravelpayoutsScript";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies()
  const headerStore = await headers()
  const lang = resolveLang(cookieStore.get("uc_lang")?.value, headerStore.get("accept-language"))

  return (
    <html
      lang={lang}
      dir={isRtl(lang) ? "rtl" : "ltr"}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <I18nProvider initialLang={lang}>{children}</I18nProvider>
        <TravelpayoutsScript />
      </body>
    </html>
  );
}
