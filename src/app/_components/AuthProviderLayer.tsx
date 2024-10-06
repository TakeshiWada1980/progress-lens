"use client";

import React, { ReactNode } from "react";
import AuthProvider from "@/app/_contexts/AuthContext";
import Header from "@/app/_components/Header";
import { Toaster } from "@/app/_components/shadcn/ui/toaster";

interface Props {
  children: ReactNode;
}

const AuthProviderLayer: React.FC<Props> = (props) => {
  return (
    <>
      <AuthProvider>
        <Header />
        <main className="mx-auto mt-14 w-full max-w-2xl px-5 md:px-0">
          <div className="relative pt-6 md:px-4">
            <div>{props.children}</div>
          </div>
        </main>
        <Toaster />
      </AuthProvider>
    </>
  );
};

export default AuthProviderLayer;
