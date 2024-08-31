"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

// カスタムフック・APIリクエスト系
import { supabase } from "@/lib/supabase";
import useAuth from "@/app/_hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// UIコンポーネント
import Link from "@/app/_components/elements/Link";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/_components/shadcn/ui/avatar";
import {
  faAddressCard,
  faPersonDigging,
  faFan,
  faRightFromBracket,
  faRightToBracket,
} from "@fortawesome/free-solid-svg-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/_components/shadcn/ui/dropdown-menu";

// 型・定数・ユーティリティ
import { twMerge } from "tailwind-merge";
import { appName } from "@/config/app-config";
import { UserProfile } from "@/app/_types/UserTypes";
import { roleEnum2str } from "@/app/_utils/roleEnum2str";

const Header: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [lastScrollY, setLastScrollY] = useState<number>(0);
  const { session, isLoading, userProfile } = useAuth();
  const router = useRouter();

  // スクロール位置に基づいてヘッダの表示・非表示を更新
  const updateHeaderVisibility = useCallback(() => {
    const currentScrollY = window.scrollY;
    setIsVisible(currentScrollY < lastScrollY || currentScrollY <= 100);
    setLastScrollY(currentScrollY);
  }, [lastScrollY]);

  // スクロールイベントリスナーを設定してヘッダーの表示・非表示を管理
  useEffect(() => {
    const handleScroll = () =>
      window.requestAnimationFrame(updateHeaderVisibility);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [updateHeaderVisibility]);

  const logoutAction = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header
      className={twMerge(
        "fixed inset-x-0 top-0 z-10 bg-white shadow-md transition-transform duration-300",
        isVisible ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <nav className="mx-auto flex max-w-2xl items-center justify-between space-x-2 px-5 py-1.5 md:px-0">
        <Link href="/" variant="unstyled" className="text-lg font-bold">
          {appName}
        </Link>

        <div className="flex">
          {isLoading ? (
            <AuthStateLoadingIndicator />
          ) : session ? (
            <AccountNavMenu
              logoutAction={logoutAction}
              userProfile={userProfile}
            />
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
  if (pathName === "/login") {
    return (
      <div className="text-slate-400">
        <FontAwesomeIcon icon={faRightToBracket} className="mr-1" />
        ログイン
      </div>
    );
  }

  return (
    <Link href="/login" variant="unstyled">
      <FontAwesomeIcon icon={faRightToBracket} className="mr-1" />
      ログイン
    </Link>
  );
};

// TODO: あとで別のコンポネントに分離
interface AccountNavMenuProps {
  logoutAction: () => void;
  userProfile: UserProfile | null;
}

const AccountNavMenu: React.FC<AccountNavMenuProps> = (props) => {
  const { logoutAction, userProfile } = props;
  const displayName = userProfile ? userProfile.displayName : "";
  let role = roleEnum2str(userProfile?.role);
  if (role !== "") {
    role = `[${role}]`;
  }

  return (
    <div className="flex items-center">
      <div className="mr-2 text-xs text-slate-500">{role}</div>
      <div className="mr-3">{displayName}</div>
      <UserMenu logoutAction={logoutAction} />
    </div>
  );
};

// TODO: あとで別のコンポネントに分離
interface UserMenuProps {
  logoutAction: () => void;
}

const UserMenu: React.FC<UserMenuProps> = (props) => {
  const { logoutAction } = props;
  const { userProfile } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const handleItemClick = () => {
    setIsOpen(false);
  };

  return (
    <DropdownMenu modal={false} open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild className="focus:outline-none">
        <div className="cursor-pointer rounded-full border-2 border-slate-300 p-0.5 hover:border-slate-400">
          <Avatar>
            <AvatarImage src={userProfile?.avatarImgUrl} />
            <AvatarFallback>
              {userProfile?.displayName?.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleItemClick}>
          <Link href="/user/profile" variant="unstyled">
            <FontAwesomeIcon icon={faAddressCard} className="mr-1" />
            アカウント設定
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-gray-400">
          <Link href="#" variant="notImplemented">
            <FontAwesomeIcon icon={faPersonDigging} className="mr-1" />
            項目1 (仮)
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-gray-400">
          <Link href="#" variant="notImplemented">
            <FontAwesomeIcon icon={faPersonDigging} className="mr-1" />
            項目2 (仮)
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-gray-400">
          <Link href="#" variant="notImplemented">
            <FontAwesomeIcon icon={faPersonDigging} className="mr-1" />
            項目3 (仮)
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logoutAction} className="cursor-pointer">
          <FontAwesomeIcon icon={faRightFromBracket} className="mr-1" />
          ログアウト
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Header;
