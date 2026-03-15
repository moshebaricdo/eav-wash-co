import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

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
  title: {
    default: "EAV Wash Co. CRM",
    template: "%s | EAV Wash Co. CRM",
  },
  description: "Lead and contact management for EAV Wash Co.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${interstate.variable} ${uncutSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
