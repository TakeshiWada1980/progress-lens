"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

// カスタムフック・APIリクエスト系
import useAuth from "@/app/_hooks/useAuth";

// UIコンポーネント
import Link from "@/app/_components/elements/Link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LoadingSpinner from "./LoadingSpinner";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/_components/shadcn/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/_components/shadcn/ui/dropdown-menu";

// 型・定数・ユーティリティ
import { roleEnum2str } from "@/app/_utils/roleEnum2str";
import { Role } from "@/app/_types/UserTypes";
import {
  studentMenuItems,
  guestStudentMenuItems,
  teacherMenuItems,
  guestTeacherMenuItems,
  adminMenuItems,
} from "@/app/_components/elements/menuItems";

export const UserNavWidget: React.FC = () => {
  const { logout, userProfile } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const displayName = userProfile ? userProfile.displayName : "";

  let roleStr = roleEnum2str(userProfile?.role);
  let menuItems = studentMenuItems;
  switch (userProfile?.role) {
    case Role.STUDENT:
      if (userProfile.isGuest) menuItems = guestStudentMenuItems;
      break;
    case Role.TEACHER:
      menuItems = userProfile.isGuest
        ? guestTeacherMenuItems
        : teacherMenuItems;
      break;
    case Role.ADMIN:
      menuItems = adminMenuItems;
      break;
  }

  const logoutAction = async () => {
    if (await logout()) {
      router.push("/login");
    }
  };

  return (
    <div className="flex items-center">
      {roleStr !== "" ? (
        <div className="mr-2 text-xs text-slate-500">[{roleStr}]</div>
      ) : (
        <LoadingSpinner message="Loading..." />
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
        <DropdownMenuContent className="mr-1">
          {menuItems.map((item, index) => (
            <DropdownMenuItem key={index} onClick={() => setIsMenuOpen(false)}>
              <Link href={item.href} style="nav" state={item.state}>
                <FontAwesomeIcon icon={item.icon} className="mr-1.5" />
                {item.label}
              </Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logoutAction} className="cursor-pointer">
            <FontAwesomeIcon icon={faRightFromBracket} className="mr-1.5" />
            ログアウト
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
