// src/components/data-grid/DataGridPagination.tsx
import { type Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface DataGridPaginationProps<TData> {
  table: Table<TData>;
  pageSizeOptions?: number[];
  totalCount?: number;

  // Server-side
  serverSide?: boolean;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function DataGridPagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 50, 100],
  totalCount,
  serverSide,
  currentPage,
  onPageChange,
  onPageSizeChange,
}: DataGridPaginationProps<TData>) {
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const totalRows = totalCount ?? table.getFilteredRowModel().rows.length;

  return (
    <div className="flex items-center justify-between px-2 py-4">
      {/* Sol: Seçim bilgisi */}
      <div className="flex-1 text-sm text-muted-foreground">
        {selectedCount > 0 ? (
          <span>
            {selectedCount} / {totalRows} satır seçildi
          </span>
        ) : (
          <span>Toplam {totalRows} kayıt</span>
        )}
      </div>

      {/* Orta: Sayfa boyutu */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">Sayfa başına</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
              onPageSizeChange?.(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sayfa bilgisi */}
        <div className="text-sm font-medium">
          Sayfa {(serverSide ? currentPage : table.getState().pagination.pageIndex + 1) ?? 1}
          {" / "}
          {serverSide
            ? Math.ceil(totalRows / table.getState().pagination.pageSize)
            : table.getPageCount()}
        </div>

        {/* Sayfa butonları */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              if (serverSide) onPageChange?.(1);
              else table.setPageIndex(0);
            }}
            disabled={
              serverSide
                ? (currentPage ?? 1) <= 1
                : !table.getCanPreviousPage()
            }
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              if (serverSide) onPageChange?.((currentPage ?? 1) - 1);
              else table.previousPage();
            }}
            disabled={
              serverSide
                ? (currentPage ?? 1) <= 1
                : !table.getCanPreviousPage()
            }
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              if (serverSide) onPageChange?.((currentPage ?? 1) + 1);
              else table.nextPage();
            }}
            disabled={
              serverSide
                ? (currentPage ?? 1) >=
                  Math.ceil(totalRows / table.getState().pagination.pageSize)
                : !table.getCanNextPage()
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              const lastPage = serverSide
                ? Math.ceil(totalRows / table.getState().pagination.pageSize)
                : table.getPageCount() - 1;
              if (serverSide) onPageChange?.(lastPage);
              else table.setPageIndex(table.getPageCount() - 1);
            }}
            disabled={
              serverSide
                ? (currentPage ?? 1) >=
                  Math.ceil(totalRows / table.getState().pagination.pageSize)
                : !table.getCanNextPage()
            }
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}