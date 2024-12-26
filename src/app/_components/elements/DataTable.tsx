"use client";

import React, { useState } from "react";
import { twMerge } from "tailwind-merge";
import { Input } from "@/app/_components/shadcn/ui/input";
import { Button } from "@/app/_components/shadcn/ui/button";

import {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/shadcn/ui/table";

interface Props<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  filterableColumn?: {
    accessorKey: string;
    msg: string;
  };
  headerClassName?: string;
}

// prettier-ignore
export const DataTable: <TData>(props: Props<TData>) => React.ReactElement = ({
  columns, data, filterableColumn, headerClassName="bg-indigo-50 hover:bg-indigo-50"
}) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // prettier-ignore
  const table = useReactTable({
    data, columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { sorting, columnFilters },
  });

  return (
    <div className="space-y-2">
      {/* フィルタテキストボックス (オプション)*/}
      {filterableColumn && (
        <div className="flex items-center">
          <Input
            name="SessionTableFilter"
            placeholder={filterableColumn.msg}
            value={
              (table
                .getColumn(filterableColumn.accessorKey)
                ?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table
                .getColumn(filterableColumn.accessorKey)
                ?.setFilterValue(event.target.value)
            }
            className="h-8 w-full rounded-md"
          />
        </div>
      )}

      {/* テーブル本体 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className={headerClassName}
              >
                {headerGroup.headers.map((header) => {
                  const style = twMerge(
                    header.column.id === "title" ? "pr-0.5" : "px-0.5",
                    header.column.id === "actions" && "px-1"
                  );
                  return (
                    <TableHead key={header.id} className={twMerge(style,"h-10")}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-white"
                >
                  {row.getVisibleCells().map((cell) => {
                    const style = twMerge(
                      cell.column.id === "title" ? "pr-0.5" : "px-0.5",
                      !["title", "teacher", "accessCode"].includes(
                        cell.column.id
                      ) && "sm:max-w-10",
                      cell.column.id === "title" && "hover:font-bold"
                    );
                    return (
                      <TableCell
                        key={cell.id}
                        className={twMerge("py-2", style)}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  表示可能なデータが存在しません
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ページネーション */}
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
