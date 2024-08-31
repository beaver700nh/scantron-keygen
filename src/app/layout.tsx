import type { Metadata } from "next";
import { Inter } from "next/font/google";

import ThemeManager from "@/app/theme";

import "./globals.css";

const font = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Scantron Keygen",
  description: "A program to generate keys for Scantron forms from ExamView files.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
    >
      <body
        className={font.className}
      >
        <ThemeManager>
          {children}
        </ThemeManager>
      </body>
    </html>
  );
}
