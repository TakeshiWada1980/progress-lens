import React, { useMemo, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { SessionSummary } from "@/app/_types/SessionTypes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import datetime2str from "@/app/_utils/datetime2str";
import {
  faPen,
  faPenToSquare,
  faBoltLightning,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/_components/shadcn/ui/tooltip";
import Link from "@/app/_components/elements/Link";
import { twMerge } from "tailwind-merge";

interface RowActionHandlers {
  isGuest: boolean;
  confirmDeleteSession: (id: string, name: string) => Promise<void>;
  confirmDuplicateSession: (id: string, name: string) => Promise<void>;
  updateSessionSummary: <K extends keyof SessionSummary>(
    id: string,
    key: K,
    value: SessionSummary[K]
  ) => Promise<void>;
}

const useTeacherSessionTableColumns = ({
  isGuest,
  updateSessionSummary,
  confirmDuplicateSession,
  confirmDeleteSession,
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
          const href = `/teacher/sessions/${session.id}`;
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
              <TooltipProvider delayDuration={500}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <FontAwesomeIcon
                      className="ml-1.5 cursor-pointer text-xs text-indigo-300 hover:text-indigo-500"
                      icon={faPenToSquare}
                      onClick={() => renameTitle(id, session.title)}
                    />
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-700 text-white">
                    タイトルを変更
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        },
      },

      {
        accessorKey: "accessCode",
        header: () => (
          <div className="text-center text-sm font-bold sm:px-1">Code</div>
        ),
        cell: ({ row }) => {
          const accessCode = row.original.accessCode;
          return <div className="text-center">{accessCode}</div>;
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
                className="size-4"
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
        accessorKey: "createdAt",
        header: ({ column }) => (
          <div className="flex flex-row items-center justify-center px-1 text-center font-bold">
            <div>作成</div>
            <div className="hidden sm:block">日</div>
            <FontAwesomeIcon
              className="cursor-pointer text-slate-400 hover:text-slate-700 sm:ml-1"
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
                <DropdownMenuContent className="mr-1">
                  <DropdownMenuItem
                    onClick={() => renameTitle(id, title)}
                    className="cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faPen} className="mr-2" />
                    名前の変更
                  </DropdownMenuItem>
                  {isGuest ? (
                    <DropdownMenuItem>
                      <div className="cursor-not-allowed text-gray-500">
                        <FontAwesomeIcon icon={faClone} className="mr-2" />
                        複製（ゲストは利用不可）
                      </div>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => confirmDuplicateSession(id, title)}
                      className="cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faClone} className="mr-2" />
                      複製
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  {isGuest ? (
                    <DropdownMenuItem>
                      <div className="cursor-not-allowed text-gray-500">
                        <FontAwesomeIcon icon={faTrash} className="mr-2" />
                        削除（ゲストは利用不可）
                      </div>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => confirmDeleteSession(id, title)}
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
    [
      confirmDeleteSession,
      confirmDuplicateSession,
      isGuest,
      renameTitle,
      switchActiveState,
    ]
  );
};

export default useTeacherSessionTableColumns;
