"use client";

import React from "react";
import { usePathname } from "next/navigation";

// カスタムフック・APIリクエスト系
import useAuth from "@/app/_hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useHeaderVisibility } from "@/app/_hooks/useHeaderVisibility";
import { UserNavWidget } from "@/app/_components/elements/UserNavWidget";

// UIコンポーネント
import Link from "@/app/_components/elements/Link";
import { faFan, faRightToBracket } from "@fortawesome/free-solid-svg-icons";

// 型・定数・ユーティリティ
import { twMerge } from "tailwind-merge";
import { appName } from "@/config/app-config";

const Header: React.FC = () => {
  const isVisible = useHeaderVisibility();
  const { session, isLoading } = useAuth();

  return (
    <header
      className={twMerge(
        "fixed inset-x-0 top-0 z-10 bg-white shadow-md transition-transform duration-300",
        isVisible ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <nav className="mx-auto flex max-w-2xl items-center justify-between space-x-2 px-5 py-1.5 md:px-0">
        <Link href="/" style="unstyled" className="text-lg font-bold">
          {appName}
        </Link>

        <div className="flex">
          {isLoading ? (
            <AuthStateLoadingIndicator />
          ) : session ? (
            <UserNavWidget />
          ) : (
            <LoginLink />
          )}
        </div>
      </nav>
    </header>
  );
};

// 未ログイン/ログイン済みの状態取得のローディング表示
const AuthStateLoadingIndicator: React.FC = () => (
  <div className="text-sm text-slate-400">
    <FontAwesomeIcon
      icon={faFan}
      className="mr-1 animate-spin animate-duration-[2000ms]"
    />
    ログイン状況の確認中...
  </div>
);

const LoginLink: React.FC = () => {
  const pathName = usePathname();
  const linkState = pathName === "/login" ? "disabled" : "enabled";

  return (
    <Link href="/login" style="nav" state={linkState}>
      <FontAwesomeIcon icon={faRightToBracket} className="mr-1" />
      ログイン
    </Link>
  );
};

export default Header;
