import React from "react";
import type { Metadata } from "next";
import { appName } from "@/config/app-config";

import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;

import "./globals.css";
import { M_PLUS_Rounded_1c } from "next/font/google";
import AuthProviderLayer from "@/app/_components/AuthProviderLayer";

const BaseFont = M_PLUS_Rounded_1c({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-m-plus-rounded-1c",
  preload: true,
});

export const metadata: Metadata = {
  title: appName,
  description: "",
};

interface Props {
  children: React.ReactNode;
}

const RootLayout: React.FC<Readonly<Props>> = (props) => {
  const { children } = props;

  return (
    <html lang="ja">
      <body className={`${BaseFont.className} bg-white`}>
        <AuthProviderLayer>{children}</AuthProviderLayer>
      </body>
    </html>
  );
};

export default RootLayout;
