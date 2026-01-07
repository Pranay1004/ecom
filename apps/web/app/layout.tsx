import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://eshant3d.com";

export const metadata: Metadata = {
  title: "Eshant 3D | Professional 3D Printing & Manufacturing",
  description:
    "Fast, precision 3D printing services. Upload STL/3MF, choose process (FDM/SLA/SLS/MJF), get instant pricing. Real-time geometry analysis.",
  keywords: [
    "3D printing",
    "3D manufacturing",
    "FDM",
    "SLA",
    "SLS",
    "MJF",
    "custom parts",
    "rapid prototyping",
  ],
  authors: [{ name: "Eshant 3D" }],
  creator: "Eshant 3D",
  publisher: "Eshant 3D",
  metadataBase: new URL(siteUrl),
  canonical: siteUrl,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Eshant 3D",
    title: "Eshant 3D | Professional 3D Printing & Manufacturing",
    description:
      "Fast, precision 3D printing services with real-time geometry analysis and instant pricing.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Eshant 3D Manufacturing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@eshant3d",
    creator: "@eshant3d",
    title: "Eshant 3D | Professional 3D Printing & Manufacturing",
    description:
      "Fast, precision 3D printing services with real-time geometry analysis and instant pricing.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
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
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrains.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
