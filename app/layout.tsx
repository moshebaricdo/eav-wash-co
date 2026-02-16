import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/app/seo";

const GA_MEASUREMENT_ID = "G-77JLWT18K5";

const interstate = localFont({
  src: [
    {
      path: "../fonts/interstate-bold-cond-58b64162258ca.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/interstate-light-cond-58b64220b1490.otf",
      weight: "300",
      style: "normal",
    },
  ],
  variable: "--font-interstate",
  display: "swap",
});

const uncutSans = localFont({
  src: [
    {
      path: "../fonts/Uncut-Sans-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/Uncut-Sans-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/Uncut-Sans-Semibold.otf",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-uncut-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  category: "Home Services",
  keywords: [
    "pressure washing Atlanta",
    "East Atlanta Village pressure washing",
    "driveway cleaning Atlanta",
    "patio cleaning Atlanta",
    "deck cleaning Atlanta",
    "residential pressure washing",
    "commercial pressure washing Atlanta",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F3EEE4" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${interstate.variable} ${uncutSans.variable}`}>
      <body>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
