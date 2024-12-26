import React, { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { SessionSummary } from "@/app/_types/SessionTypes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import datetime2str from "@/app/_utils/datetime2str";
import {
  faBoltLightning,
  faSort,
  faEllipsisVertical,
  faTrash,
  faCommentSlash,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/_components/shadcn/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/_components/shadcn/ui/tooltip";
import Link from "@/app/_components/elements/Link";
import { twMerge } from "tailwind-merge";

interface SessionRowContext {
  isGuest: boolean;
  confirmUnenrollSession: (id: string, name: string) => Promise<void>;
}

const useStudentSessionTableColumns = ({
  isGuest,
  confirmUnenrollSession,
}: SessionRowContext): ColumnDef<SessionSummary>[] => {
  //

  return useMemo(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => (
          <div className="font-bold">
            ラーニングセッション
            <FontAwesomeIcon
              className="ml-1 cursor-pointer text-slate-400 hover:text-slate-700"
              icon={faSort}
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            />
          </div>
        ),
        cell: ({ row }) => {
          const session = row.original;
          const href = `/student/sessions/${session.accessCode}`;
          return (
            <div
              className={twMerge(
                "text-base",
                !session.isActive && "text-gray-300"
              )}
            >
              <Link href={href} style="unstyled">
                {session.title}
              </Link>
              {!session.isActive && (
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-sm text-pink-300">
                        <FontAwesomeIcon
                          icon={faCommentSlash}
                          className="mx-1"
                        />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-700 text-white">
                      回答の受付を停止中です（回答の確認は可能です）。
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          );
        },
      },

      {
        accessorKey: "teacherName",
        header: ({ column }) => (
          <div className="flex flex-row items-center justify-center text-center font-bold">
            <div>教員</div>
            <FontAwesomeIcon
              className="ml-1 cursor-pointer text-slate-400 hover:text-slate-700"
              icon={faSort}
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            />
          </div>
        ),
        cell: ({ row }) => {
          return (
            <div className="flex justify-center">
              <div className="text-center">{row.original.teacherName}</div>
            </div>
          );
        },
      },

      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <div className="flex flex-row items-center justify-center px-1 text-center font-bold">
            <div>
              <FontAwesomeIcon icon={faClock} className="mr-1 sm:hidden" />
            </div>
            <div className="hidden sm:block">作成日</div>
            <FontAwesomeIcon
              className="ml-1 cursor-pointer text-slate-400 hover:text-slate-700"
              icon={faSort}
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            />
          </div>
        ),
        cell: ({ row }) => {
          const updatedAt = row.original.createdAt;
          return (
            <div className="flex flex-col justify-center text-center text-xs">
              <div>
                <span className="hidden sm:inline-block">
                  {datetime2str(updatedAt, "YYYY/")}
                </span>
                {datetime2str(updatedAt, "MM/DD")}
              </div>
              <div>{datetime2str(updatedAt, "HH:mm")}</div>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => (
          <div className="items-center text-center">
            <FontAwesomeIcon icon={faBoltLightning} />
          </div>
        ),
        cell: ({ row }) => {
          const id = row.original.id;
          const title = row.original.title;
          return (
            <div>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild className="focus:outline-none">
                  <div className="flex justify-center px-3 py-1 text-slate-400 hover:cursor-pointer hover:text-slate-700">
                    <FontAwesomeIcon icon={faEllipsisVertical} />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {isGuest ? (
                    <DropdownMenuItem>
                      <div className="cursor-not-allowed text-gray-500">
                        <FontAwesomeIcon icon={faTrash} className="mr-2" />
                        削除（ゲストは利用不可）
                      </div>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => confirmUnenrollSession(id, title)}
                      className="cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faTrash} className="mr-2" />
                      削除
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [confirmUnenrollSession, isGuest]
  );
};

export default useStudentSessionTableColumns;
