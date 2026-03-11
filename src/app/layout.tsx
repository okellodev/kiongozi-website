import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"], 
  weight: ["400", "600", "700"],
  variable: "--font-cormorant"
});

export const metadata: Metadata = {
  title: "Kioo Ngozi Leather | Premium Handcrafted Kenyan Leather Goods",
  description: "Experience the spirit of Kiongozi. High-resolution leather heritage pieces designed for leaders. Handcrafted in Nairobi, Kenya.",
  keywords: ["Kenyan leather", "handmade bags", "artisan shoes", "Nairobi fashion", "luxury leather goods", "Kioo Ngozi"],
  authors: [{ name: "Kioo Ngozi Leather" }],
  openGraph: {
    title: "Kioo Ngozi Leather | Handcrafted Excellence",
    description: "Premium handcrafted leather products from Kenya. Heritage pieces designed to tell your story of leadership.",
    url: "https://kioongozi.com",
    siteName: "Kioo Ngozi",
    images: [
      {
        url: "/og-image.jpg", // Make sure this file exists in /public
        width: 1200,
        height: 630,
        alt: "Kioo Ngozi Leather Showcase",
      },
    ],
    locale: "en_KE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kioo Ngozi Leather | Handcrafted Kenyan Leather",
    description: "Heritage leather pieces designed for leaders. Experience authentic Kenyan craftsmanship.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${cormorant.variable}`} style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
