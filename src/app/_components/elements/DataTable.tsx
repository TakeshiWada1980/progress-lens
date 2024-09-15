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

interface Props<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterableColumn?: {
    accessorKey: string;
    msg: string;
  };
}

export const DataTable = <TData, TValue>({
  columns,
  data,
  filterableColumn,
}: Props<TData, TValue>) => {
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
            className="max-w-sm"
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
                className="bg-sky-50 hover:bg-sky-50"
              >
                {headerGroup.headers.map((header) => {
                  let style = header.column.id === "title" ? "" : "px-0.5";
                  style = twMerge(
                    style,
                    header.column.id === "actions" && "px-1"
                  );
                  return (
                    <TableHead key={header.id} className={style}>
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
                >
                  {row.getVisibleCells().map((cell) => {
                    const style =
                      cell.column.id === "title" ? "" : "px-0.5 sm:max-w-10";
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
