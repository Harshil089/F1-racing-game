import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "F1 Reflex Racing | Test Your Reaction Time",
  description: "Experience the thrill of Formula 1 race starts. Test your reaction time against AI drivers in this authentic F1-themed reflex game.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "F1 Reflex Racing",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
