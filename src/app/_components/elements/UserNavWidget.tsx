"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

// カスタムフック・APIリクエスト系
import useAuth from "@/app/_hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// UIコンポーネント
import Link, { link } from "@/app/_components/elements/Link";
import {
  faAddressCard,
  faPersonDigging,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/_components/shadcn/ui/avatar";
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
import { roleEnum2str } from "@/app/_utils/roleEnum2str";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { type VariantProps } from "tailwind-variants";

type LinkVariants = VariantProps<typeof link>;

interface MenuItem {
  label: string;
  href: string;
  state?: LinkVariants["state"];
  icon: IconDefinition;
}

export const UserNavWidget: React.FC = () => {
  const { logout, userProfile } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const displayName = userProfile ? userProfile.displayName : "";
  let role = roleEnum2str(userProfile?.role);

  // TODO: ロールに応じてメニュー項目を変更
  const menuItems: MenuItem[] = [
    {
      label: "アカウント設定",
      href: "/user/profile",
      state: "enabled",
      icon: faAddressCard,
    },
    {
      label: "項目1 (仮)",
      href: "#",
      state: "notImplemented",
      icon: faPersonDigging,
    },
    {
      label: "項目2 (仮)",
      href: "#",
      state: "notImplemented",
      icon: faPersonDigging,
    },
    {
      label: "項目3 (仮)",
      href: "#",
      state: "notImplemented",
      icon: faPersonDigging,
    },
  ];

  const logoutAction = async () => {
    if (await logout()) {
      router.push("/login");
    }
  };

  return (
    <div className="flex items-center">
      {role !== "" && (
        <div className="mr-2 text-xs text-slate-500">[{role}]</div>
      )}
      <div className="mr-3">{displayName}</div>
      <DropdownMenu
        modal={false}
        open={isMenuOpen}
        onOpenChange={setIsMenuOpen}
      >
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
          {menuItems.map((item, index) => (
            <DropdownMenuItem key={index} onClick={() => setIsMenuOpen(false)}>
              <Link href={item.href} style="nav" state={item.state}>
                <FontAwesomeIcon icon={item.icon} className="mr-1" />
                {item.label}
              </Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logoutAction} className="cursor-pointer">
            <FontAwesomeIcon icon={faRightFromBracket} className="mr-1" />
            ログアウト
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
