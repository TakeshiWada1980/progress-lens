"use client";

import React from "react";
import useRouteGuard from "@/app/_hooks/useRouteGuard";
import LoadingPage from "@/app/_components/LoadingPage";
import { Role } from "@/app/_types/UserTypes";
import { useRouter } from "next/navigation";

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = (props) => {
  const { children } = props;
  const { isAuthenticated, isLoading, role } = useRouteGuard();
  const router = useRouter();

  if (isLoading) {
    return <LoadingPage />;
  }

  // 認証を終えるまでは何も表示しない
  if (!isAuthenticated) return null;

  // 管理者以外のときはトップページにリダイレクト
  if (role !== Role.ADMIN) {
    router.replace("/");
    return null;
  }

  return <>{children}</>;
};

export default Layout;
