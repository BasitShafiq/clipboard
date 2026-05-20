import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clip — Cross-Device Clipboard",
  description: "Share text and images between devices instantly",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
