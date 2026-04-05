import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "../components/Layout/Header";
import { Footer } from "../components/Layout/Footer";
import { Toaster } from "react-hot-toast";
import { ClerkProvider } from "@clerk/nextjs";
import { CollectionProvider } from "@/context/CollectionContext";
import { ChatProvider } from "@/context/ChatContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "Wisora",
  description: "Wisora is a platform for analyzing customer reports with AI for Wieland"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="en">
      <ClerkProvider>
        <CollectionProvider>
          <ChatProvider>
            <body
              suppressHydrationWarning
              className={`${geistSans.variable} ${geistMono.variable} antialiased grid grid-rows-[auto_1fr_auto] min-h-screen`}
            >
              <Toaster position="top-center" />
              <Header />
              {children}
              <Footer />
            </body>
          </ChatProvider>
        </CollectionProvider>
      </ClerkProvider>
    </html>
  );
}
