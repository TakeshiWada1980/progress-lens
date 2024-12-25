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
import Link from "@/app/_components/elements/Link";
import { twMerge } from "tailwind-merge";

interface RowActionHandlers {
  confirmUnenrollSession: (id: string, name: string) => Promise<void>;
}

const useStudentSessionTableColumns = ({
  confirmUnenrollSession,
}: RowActionHandlers): ColumnDef<SessionSummary>[] => {
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
                <FontAwesomeIcon
                  icon={faCommentSlash}
                  className="ml-2 text-sm"
                />
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
                  <DropdownMenuItem
                    onClick={() => confirmUnenrollSession(id, title)}
                    className="cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faTrash} className="mr-2" />
                    リストから削除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [confirmUnenrollSession]
  );
};

export default useStudentSessionTableColumns;
