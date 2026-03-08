// src/components/data-grid/DataGrid.tsx
import { useState } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type Row,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem as ContextMenuItemUI,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { DataGridToolbar } from "./DataGridToolbar";
import { DataGridPagination } from "./DataGridPagination";
import { DataGridFilters, ColumnFilter } from "./DataGridFilters";
import { type DataGridProps } from "./types";
import { cn } from "@/lib/utils";

export function DataGrid<TData>({
  data,
  columns,
  pagination = true,
  pageSize = 10,
  pageSizeOptions = [10, 20, 30, 50, 100],
  searchable = true,
  searchPlaceholder = "Ara...",
  sortable = true,
  filterable = true,
  exportable = false,
  exportFileName = "data",
  onRowClick,
  onRowDoubleClick,
  contextMenuItems,
  toolbarActions,
  title,
  loading = false,
  emptyMessage = "Kayıt bulunamadı.",
  totalCount,
  currentPage,
  onPageChange,
  onPageSizeChange,
  serverSide = false,
}: DataGridProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable<TData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(!serverSide && pagination
      ? { getPaginationRowModel: getPaginationRowModel() }
      : {}),
    ...(sortable ? { getSortedRowModel: getSortedRowModel() } : {}),
    ...(filterable || searchable
      ? {
          getFilteredRowModel: getFilteredRowModel(),
          getFacetedRowModel: getFacetedRowModel(),
          getFacetedUniqueValues: getFacetedUniqueValues(),
        }
      : {}),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    initialState: {
      pagination: { pageSize },
    },
  });

  // Satır render fonksiyonu (Context Menu ile)
  const renderTableRow = (row: Row<TData>) => {
    const rowContent = (
      <TableRow
        key={row.id}
        className={cn(
          onRowClick && "cursor-pointer hover:bg-muted/50"
        )}
        onClick={() => onRowClick?.(row.original)}
        onDoubleClick={() => onRowDoubleClick?.(row.original)}
      >
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    );

    // Context menu yoksa direkt satırı döndür
    if (!contextMenuItems || contextMenuItems.length === 0) {
      return rowContent;
    }

    // Context menu varsa sar
    return (
      <ContextMenu key={row.id}>
        <ContextMenuTrigger asChild>{rowContent}</ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          {contextMenuItems.map((item, index) => {
            if (item.visible && !item.visible(row.original)) {
              return null;
            }

            const isDisabled = item.disabled?.(row.original) ?? false;

            return (
              <div key={index}>
                <ContextMenuItemUI
                  disabled={isDisabled}
                  className={cn(
                    item.variant === "destructive" &&
                      "text-destructive focus:text-destructive focus:bg-destructive/10"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    item.onClick(row.original);
                  }}
                >
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.label}
                </ContextMenuItemUI>
                {item.separator && <ContextMenuSeparator />}
              </div>
            );
          })}
        </ContextMenuContent>
      </ContextMenu>
    );
  };

  // Loading
  if (loading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-8 w-full" />
        {[...Array(pageSize > 5 ? 5 : pageSize)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <DataGridToolbar
        table={table}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        searchable={searchable}
        searchPlaceholder={searchPlaceholder}
        exportable={exportable}
        exportFileName={exportFileName}
        data={data}
        title={title}
        toolbarActions={toolbarActions}
      />

      {/* Aktif filtre bilgisi */}
      {filterable && <DataGridFilters<TData> table={table} />}

      {/* Tablo */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{
                      width:
                        header.getSize() !== 150
                          ? header.getSize()
                          : undefined,
                    }}
                    className="align-top"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}

                    {filterable &&
                      header.column.getCanFilter() &&
                      header.column.columnDef.enableColumnFilter !== false && (
                        <div className="mt-1">
                          <ColumnFilter<TData> column={header.column} />
                        </div>
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => renderTableRow(row))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <DataGridPagination
          table={table}
          pageSizeOptions={pageSizeOptions}
          totalCount={totalCount}
          serverSide={serverSide}
          currentPage={currentPage}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}