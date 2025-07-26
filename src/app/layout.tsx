import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VAPI Voice Bot Platform - Create AI Voice Assistants",
  description: "Build and deploy custom AI voice bots with advanced RAG capabilities, voice navigation, and seamless integration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Provide fallback for build process
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_fallback';

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <html lang="en">
        <body className={`${inter.className} antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
