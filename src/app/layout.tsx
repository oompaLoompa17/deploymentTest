import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Todo App with Supabase",
  description: "A simple todo app using Next.js, TypeScript, and Supabase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
