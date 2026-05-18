"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

export interface DataTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
  className,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-gray-500">
        No data
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-white/10",
        className
      )}
    >
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10 bg-white/5">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400",
                  col.className
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.map((item, rowIdx) => (
            <tr
              key={String(item.id ?? rowIdx)}
              onClick={() => onRowClick?.(item)}
              className={cn(
                "transition-colors duration-150",
                onRowClick && "cursor-pointer",
                rowIdx % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]",
                onRowClick && "hover:bg-white/5"
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-sm text-gray-300",
                    col.className
                  )}
                >
                  {col.render
                    ? col.render(item)
                    : (item[col.key] as ReactNode) ?? "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
