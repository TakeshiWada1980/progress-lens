"use client";

import React from "react";
import useRouteGuard from "@/app/_hooks/useRouteGuard";
import LoadingPage from "@/app/_components/LoadingPage";
import { Role } from "@/app/_types/UserTypes";
import { usePathname } from "next/navigation";

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = (props) => {
  const { children } = props;
  const { isAuthorized, isLoading } = useRouteGuard(
    Role.STUDENT,
    usePathname()
  );

  if (isLoading) return <LoadingPage />;

  // 認可がない場合は何も表示しない
  if (!isAuthorized) return null;
  return <>{children}</>;
};

export default Layout;
