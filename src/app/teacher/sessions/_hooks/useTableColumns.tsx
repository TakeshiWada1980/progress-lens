import React, { useMemo, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { SessionSummary } from "@/app/_types/SessionTypes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import datetime2str from "@/app/_utils/datetime2str";
import {
  faPen,
  faClock,
  faSort,
  faEllipsisVertical,
  faClone,
  faTrash,
  faUser,
  faFileLines,
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
  deleteSession: (id: string) => Promise<void>;
  updateSessionSummary: <K extends keyof SessionSummary>(
    id: string,
    key: K,
    value: SessionSummary[K]
  ) => Promise<void>;
}

const useTableColumns = ({
  updateSessionSummary,
  deleteSession,
}: RowActionHandlers): ColumnDef<SessionSummary>[] => {
  //
  const renameTitle = useCallback(
    async (id: string, currentValue: string) => {
      await updateSessionSummary(id, "title", currentValue);
    },
    [updateSessionSummary]
  );

  const switchActiveState = useCallback(
    async (id: string, currentValue: boolean) => {
      await updateSessionSummary(id, "isActive", !currentValue);
    },
    [updateSessionSummary]
  );

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
          const id = row.original.id;
          const session = row.original;
          const href = `/teacher/sessions/${session.accessCode}`;
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
              <FontAwesomeIcon
                className="ml-1 cursor-pointer text-xs text-slate-300 hover:text-slate-600"
                icon={faPen}
                onClick={() => renameTitle(id, session.title)}
              />
            </div>
          );
        },
      },

      {
        accessorKey: "isActive",
        header: () => <div className="text-center font-bold sm:px-1">有効</div>,
        cell: ({ row }) => {
          const id = row.original.id;
          const isActive = row.original.isActive;
          return (
            <div className="flex justify-center">
              <input
                name={`isActive_${id}`}
                type="checkbox"
                className="size-4 sm:size-5"
                checked={isActive}
                onChange={() => switchActiveState(id, isActive)}
                readOnly
              />
            </div>
          );
        },
      },

      {
        accessorKey: "enrollmentCount",
        header: () => (
          <div className="hidden px-1 text-center sm:block sm:px-2">
            <FontAwesomeIcon icon={faUser} />
          </div>
        ),
        cell: ({ row }) => {
          const enrollmentCount = row.original.enrollmentCount;
          return (
            <div className="hidden text-center sm:block">{enrollmentCount}</div>
          );
        },
      },

      {
        accessorKey: "questionsCount",
        header: () => (
          <div className="hidden px-1 text-center sm:block sm:px-2">
            <FontAwesomeIcon icon={faFileLines} />
          </div>
        ),
        cell: ({ row }) => {
          const questionsCount = row.original.questionsCount;
          return (
            <div className="hidden text-center sm:block">{questionsCount}</div>
          );
        },
      },

      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <div className="text-center font-bold">
            作成日
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
                    onClick={() => renameTitle(id, title)}
                    className="cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faPen} className="mr-2" />
                    名前の変更
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Link href="#" style="nav" state="notImplemented">
                      <FontAwesomeIcon icon={faClone} className="mr-2" />
                      複製
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => deleteSession(id)}
                    className="cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faTrash} className="mr-2" />
                    削除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [deleteSession, renameTitle, switchActiveState]
  );
};

export default useTableColumns;
