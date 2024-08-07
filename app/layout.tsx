// import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chat With pdf",
  description: "Transform your pdf's into interactive conversation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Navbar />
          <div className="flex-1 relative grainy-light bg-blue-50">
            {children}
          </div>
          {/* <Toaster /> */}
        </body>
      </html>
    </ClerkProvider>
  );
}
