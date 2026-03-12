// src/components/data-grid/DataGridToolbar.tsx
import { type Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataGridExport } from "./DataGridExport";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { ReactNode } from "react";

interface DataGridToolbarProps<TData> {
  table: Table<TData>;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  exportable?: boolean;
  exportFileName?: string;
  data: TData[];
  title?: string;
  toolbarActions?: ReactNode;
}

export function DataGridToolbar<TData>({
  table,
  globalFilter,
  setGlobalFilter,
  searchable = true,
  searchPlaceholder = "Ara...",
  exportable = false,
  exportFileName = "data",
  data,
  title,
  toolbarActions,
}: DataGridToolbarProps<TData>) {
  const isFiltered =
    table.getState().columnFilters.length > 0 || globalFilter.length > 0;

  return (
    <div className="flex flex-col gap-4 py-4">
      {/* Üst satır: Başlık ve aksiyonlar */}
      {(title || toolbarActions) && (
        <div className="flex items-center justify-between">
          {title && <h2 className="text-xl font-semibold">{title}</h2>}
          {toolbarActions && <div className="flex gap-2">{toolbarActions}</div>}
        </div>
      )}

      {/* Alt satır: Arama, filtre, export */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          {/* Global Arama */}
          {searchable && (
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          )}

          {/* Filtreleri Temizle */}
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                table.resetColumnFilters();
                setGlobalFilter("");
              }}
            >
              Temizle
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Sütun Görünürlüğü */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Sütunlar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Görünür Sütunlar</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((col) => col.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Excel Export */}
          {exportable && (
            <DataGridExport
              table={table}
              data={data}
              fileName={exportFileName}
            />
          )}
        </div>
      </div>
    </div>
  );
}