"use client";

import React from "react";
import useRouteGuard from "@/app/_hooks/useRouteGuard";
import LoadingPage from "@/app/_components/LoadingPage";
import { useRouter } from "next/navigation";

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = (props) => {
  const { children } = props;
  const { isAuthenticated, isLoading } = useRouteGuard();

  if (isLoading) {
    return <LoadingPage />;
  }

  // 認証を終えるまでは何も表示しない
  if (!isAuthenticated) return null;

  return <>{children}</>;
};

export default Layout;
