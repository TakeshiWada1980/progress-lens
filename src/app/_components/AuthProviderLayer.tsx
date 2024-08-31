"use client";

import React, { ReactNode } from "react";
import BaseLayout from "./BaseLayout";
import AuthProvider from "@/app/_contexts/AuthContext";

interface Props {
  children: ReactNode;
}

const AuthProviderLayer: React.FC<Props> = (props) => {
  return (
    <>
      <AuthProvider>
        <BaseLayout>{props.children}</BaseLayout>
      </AuthProvider>
    </>
  );
};

export default AuthProviderLayer;
