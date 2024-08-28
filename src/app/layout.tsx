import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ProgressLens",
  description: "",
};

interface Props {
  children: React.ReactNode;
}

const RootLayout: React.FC<Readonly<Props>> = (props) => {
  const { children } = props;
  return (
    <html lang="ja">
      <body className={inter.className}>{children}</body>
    </html>
  );
};

export default RootLayout;
