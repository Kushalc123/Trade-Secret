/* src/app/layout.tsx */
import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Trade Secret",
  description: "AI-powered product-photo editor"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
