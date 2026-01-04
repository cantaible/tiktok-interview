import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Local News Harvester",
  description: "Aggregate and filter news from multiple sources with AI-powered summaries",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="border-b border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl">📰</span>
                <h1 className="text-xl font-bold text-gray-900">Local News Harvester</h1>
              </Link>
              <nav className="flex space-x-4">
                <Link
                  href="/"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/sources"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sources
                </Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
