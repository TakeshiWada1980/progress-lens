"use client";

import React from "react";
import useRouteGuard from "@/app/_hooks/useRouteGuard";
import LoadingPage from "@/app/_components/LoadingPage";

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = (props) => {
  const { children } = props;
  const { isAuthenticated, isLoading } = useRouteGuard();

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!isAuthenticated) {
    return null; // 認証されていない場合は何も表示しない
  }
  // ログイン(認証済み)が確認できてから子コンポーネントをレンダリング
  return <>{children}</>;
};

export default Layout;
