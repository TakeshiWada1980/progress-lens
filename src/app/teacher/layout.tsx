"use client";

import React from "react";
import useRouteGuard from "@/app/_hooks/useRouteGuard";
import LoadingPage from "@/app/_components/LoadingPage";
import { Role } from "@prisma/client";
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

  // 管理者もしくは教員ではないとき（つまり学生のとき）
  if (role === Role.STUDENT) {
    router.replace("/");
    return null;
  }

  return <>{children}</>;
};

export default Layout;
