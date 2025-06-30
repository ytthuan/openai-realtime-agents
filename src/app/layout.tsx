import type { Metadata } from "next";
import "./globals.css";
import "./lib/envSetup";

export const metadata: Metadata = {
  title: "Azure AI Voice Agents",
  description: "A demo app from Azure OpenAI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
