// src/components/data-grid/DataGrid.tsx
import { useState, Fragment, useEffect } from "react";
import {
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type Row,
  type Header,
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
import { Checkbox } from "../ui/checkbox";
import { ChevronRight, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ─── Sürüklenebilir header hücresi ───────────────────────────────────────────
function DraggableHeader<TData>({
  header,
  filterable,
  columnResizable,
}: {
  header: Header<TData, unknown>;
  filterable?: boolean;
  columnResizable?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: header.column.id });

  return (
    <TableHead
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        width: header.getSize(),
        position: "relative",
        overflow: "hidden",
        ...(header.column.columnDef.meta?.sticky && {
          position: "sticky",
          [header.column.columnDef.meta.sticky]: 0,
          zIndex: 2,
          background: "hsl(var(--background))",
        }),
      }}
      className="align-top py-1 cursor-grab"
      {...attributes}
      {...listeners}
    >
      {header.isPlaceholder
        ? null
        : flexRender(header.column.columnDef.header, header.getContext())}

      {filterable &&
        header.column.getCanFilter() &&
        header.column.columnDef.enableColumnFilter !== false && (
          <div className="mt-0.5 pb-0.5">
            <ColumnFilter<TData> column={header.column} />
          </div>
        )}

      {columnResizable && header.column.getCanResize() && (
        <div
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          className={cn(
            "absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none",
            "bg-border hover:bg-primary/50",
            header.column.getIsResizing() && "bg-primary"
          )}
        />
      )}
    </TableHead>
  );
}

// ─── Sürüklenebilir satır ─────────────────────────────────────────────────────
function DraggableRow<TData>({
  row,
  children,
  className,
  style,
}: {
  row: Row<TData>;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id });

  return (
    <TableRow
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        ...style,
      }}
      className={cn("hover:bg-muted/50", className)}
    >
      <TableCell className="w-8 px-2" {...attributes} {...listeners}>
        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
      </TableCell>
      {children}
    </TableRow>
  );
}

// ─── Ana DataGrid bileşeni ────────────────────────────────────────────────────
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
  selectionMode = "none",
  rowClassName,
  rowStyle,
  expandable,
  expandedRowRender,
  columnReorder,
  onColumnReorder,
  rowDraggable,
  onRowReorder,
  summaryRow,
  columnResizable,
  keyboardNavigation,
}: DataGridProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [focusedRowIndex, setFocusedRowIndex] = useState<number>(-1);
  const [draggableData, setDraggableData] = useState<TData[]>(data);
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    columns.map(
      (col) =>
        (col as { id?: string; accessorKey?: string }).id ??
        (col as { accessorKey?: string }).accessorKey ??
        ""
    )
  );

  useEffect(() => {
    setDraggableData(data);
  }, [data]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleColumnDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setColumnOrder((prev) => {
        const oldIndex = prev.indexOf(active.id as string);
        const newIndex = prev.indexOf(over.id as string);
        const newOrder = arrayMove(prev, oldIndex, newIndex);
        onColumnReorder?.(newOrder);
        return newOrder;
      });
    }
  };

  const handleRowDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setDraggableData((prev) => {
        const oldIndex = prev.findIndex((_, i) => String(i) === active.id);
        const newIndex = prev.findIndex((_, i) => String(i) === over.id);
        const newData = arrayMove(prev, oldIndex, newIndex);
        onRowReorder?.(newData);
        return newData;
      });
    }
  };

  const table = useReactTable<TData>({
    data: rowDraggable ? draggableData : data,
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
    ...(columnResizable ? { columnResizeMode: "onChange" as const } : {}),
    enableRowSelection: selectionMode !== "none",
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onColumnOrderChange: setColumnOrder,
    onRowSelectionChange: (updater) => {
      const newSelection =
        typeof updater === "function" ? updater(rowSelection) : updater;
      if (selectionMode === "single") {
        const firstKey = Object.keys(newSelection).find((key) => newSelection[key]);
        setRowSelection(firstKey ? { [firstKey]: true } : {});
      } else {
        setRowSelection(newSelection);
      }
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
      rowSelection,
      columnOrder,
    },
    initialState: {
      pagination: { pageSize },
    },
  });

  // Toplam kolon sayısı
  const totalColSpan =
    columns.length +
    (rowDraggable ? 1 : 0) +
    ((expandable || selectionMode !== "none") ? 1 : 0);

  // Klavye navigasyonu handler
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTableRowElement>,
    row: Row<TData>
  ) => {
    if (!keyboardNavigation) return;
    const rows = table.getRowModel().rows;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.min(focusedRowIndex + 1, rows.length - 1);
      setFocusedRowIndex(next);
      onRowClick?.(rows[next].original);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = Math.max(focusedRowIndex - 1, 0);
      setFocusedRowIndex(prev);
      onRowClick?.(rows[prev].original);
    }
    if (e.key === "Enter") {
      onRowDoubleClick?.(row.original);
    }
    if (e.key === " ") {
      e.preventDefault();
      if (selectionMode !== "none") row.toggleSelected();
    }
  };

  // Expand + Select birleşik hücre
  const renderControlCell = (row: Row<TData>) => {
    const isExpanded = expanded[row.id] ?? false;
    return (
      <TableCell className="w-10 px-2">
        <div className="flex items-center gap-1.5">
          {expandable && (
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 flex-shrink-0 cursor-pointer",
                isExpanded && "rotate-90"
              )}
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((prev) => ({ ...prev, [row.id]: !prev[row.id] }));
              }}
            />
          )}
          {selectionMode !== "none" && (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => {
                if (selectionMode === "single") {
                  setRowSelection(value ? { [row.id]: true } : {});
                } else {
                  row.toggleSelected(!!value);
                }
              }}
              aria-label="Select row"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      </TableCell>
    );
  };

  // Normal mod satır render
  const renderTableRow = (row: Row<TData>) => {
    const isExpanded = expanded[row.id] ?? false;
    const isFocused = keyboardNavigation && focusedRowIndex === row.index;

    const mainRow = (
      <TableRow
        key={row.id}
        tabIndex={keyboardNavigation ? 0 : undefined}
        className={cn(
          (onRowClick || expandable) && "cursor-pointer",
          "hover:bg-muted/50",
          isFocused && "ring-2 ring-inset ring-primary",
          rowClassName?.(row.original)
        )}
        style={rowStyle?.(row.original)}
        onClick={() => {
          if (expandable) {
            setExpanded((prev) => ({ ...prev, [row.id]: !prev[row.id] }));
          }
          setFocusedRowIndex(row.index);
          onRowClick?.(row.original);
        }}
        onDoubleClick={() => onRowDoubleClick?.(row.original)}
        onKeyDown={(e) => handleKeyDown(e, row)}
      >
        {(expandable || selectionMode !== "none") && renderControlCell(row)}
        {row.getVisibleCells().map((cell) => (
          <TableCell
            key={cell.id}
            style={{
              ...(cell.column.columnDef.meta?.sticky && {
                position: "sticky",
                [cell.column.columnDef.meta.sticky]: 0,
                zIndex: 1,
                background: "hsl(var(--background))",
              }),
            }}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    );

    const expandedRow = expandable && isExpanded && expandedRowRender && (
      <TableRow
        key={`${row.id}-expanded`}
        className="bg-muted/20 hover:bg-muted/20"
      >
        <TableCell colSpan={totalColSpan} className="p-4">
          {expandedRowRender(row.original)}
        </TableCell>
      </TableRow>
    );

    if (!contextMenuItems || contextMenuItems.length === 0) {
      return (
        <Fragment key={row.id}>
          {mainRow}
          {expandedRow}
        </Fragment>
      );
    }

    return (
      <Fragment key={row.id}>
        <ContextMenu>
          <ContextMenuTrigger asChild>{mainRow}</ContextMenuTrigger>
          <ContextMenuContent className="w-56">
            {contextMenuItems.map((item, index) => {
              if (item.visible && !item.visible(row.original)) return null;
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
        {expandedRow}
      </Fragment>
    );
  };

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

      {filterable && <DataGridFilters<TData> table={table} />}

      <div className="rounded-md border overflow-auto">
        <Table
          style={{
            width: columnResizable ? table.getTotalSize() : undefined,
            tableLayout: columnResizable ? "fixed" : undefined,
          }}
        >
          {/* ── HEADER ── */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleColumnDragEnd}
          >
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-muted/50">

                  {/* Grip kolonu header placeholder */}
                  {rowDraggable && <TableHead className="w-8 px-2" />}

                  {/* Expand + Select header hücresi */}
                  {(expandable || selectionMode !== "none") && (
                    <TableHead className="w-10 px-2">
                      {selectionMode === "multiple" && (
                        <Checkbox
                          checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() && "indeterminate")
                          }
                          onCheckedChange={(value) =>
                            table.toggleAllPageRowsSelected(!!value)
                          }
                          aria-label="Select all"
                        />
                      )}
                    </TableHead>
                  )}

                  <SortableContext
                    items={columnOrder}
                    strategy={horizontalListSortingStrategy}
                  >
                    {headerGroup.headers.map((header) =>
                      columnReorder ? (
                        <DraggableHeader
                          key={header.id}
                          header={header}
                          filterable={filterable}
                          columnResizable={columnResizable}
                        />
                      ) : (
                        <TableHead
                          key={header.id}
                          style={{
                            width: header.getSize(),
                            position: "relative",
                            overflow: "hidden",
                            ...(header.column.columnDef.meta?.sticky && {
                              position: "sticky",
                              [header.column.columnDef.meta.sticky]: 0,
                              zIndex: 2,
                              background: "hsl(var(--background))",
                            }),
                          }}
                          className="align-top py-1"
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
                              <div className="mt-0.5 pb-0.5">
                                <ColumnFilter<TData> column={header.column} />
                              </div>
                            )}

                          {columnResizable && header.column.getCanResize() && (
                            <div
                              onMouseDown={header.getResizeHandler()}
                              onTouchStart={header.getResizeHandler()}
                              className={cn(
                                "absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none",
                                "bg-border hover:bg-primary/50",
                                header.column.getIsResizing() && "bg-primary"
                              )}
                            />
                          )}
                        </TableHead>
                      )
                    )}
                  </SortableContext>
                </TableRow>
              ))}
            </TableHeader>
          </DndContext>

          {/* ── BODY ── */}
          <TableBody>
            {table.getRowModel().rows?.length ? (
              rowDraggable ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleRowDragEnd}
                >
                  <SortableContext
                    items={table.getRowModel().rows.map((row) => row.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => {
                      const isExpanded = expanded[row.id] ?? false;
                      return (
                        <Fragment key={row.id}>
                          <DraggableRow
                            row={row}
                            className={rowClassName?.(row.original)}
                            style={rowStyle?.(row.original)}
                          >
                            {(expandable || selectionMode !== "none") &&
                              renderControlCell(row)}
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </TableCell>
                            ))}
                          </DraggableRow>

                          {expandable && isExpanded && expandedRowRender && (
                            <TableRow className="bg-muted/20 hover:bg-muted/20">
                              <TableCell colSpan={totalColSpan} className="p-4">
                                {expandedRowRender(row.original)}
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      );
                    })}
                  </SortableContext>
                </DndContext>
              ) : (
                table.getRowModel().rows.map((row) => renderTableRow(row))
              )
            ) : (
              <TableRow>
                <TableCell
                  colSpan={totalColSpan}
                  className="h-32 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>

          {/* ── ÖZET SATIRI ── */}
          {summaryRow && data.length > 0 && (
            <tfoot>
              <tr className="border-t-2 bg-muted/50 font-medium text-sm">
                {rowDraggable && <td className="w-8" />}
                {(expandable || selectionMode !== "none") && <td className="w-10" />}
                {table.getVisibleLeafColumns().map((column) => {
                  const key = column.id as keyof TData;
                  let value: string | number = "";

                  if (typeof summaryRow === "function") {
                    const result = summaryRow(data);
                    value = (result[key] as string | number) ?? "";
                  } else {
                    const agg = (
                      summaryRow as Partial<
                        Record<keyof TData, "sum" | "avg" | "min" | "max" | "count">
                      >
                    )[key];
                    if (agg) {
                      const vals = data
                        .map((row) => Number(row[key]))
                        .filter((v) => !isNaN(v));
                      if (agg === "sum")   value = vals.reduce((a, b) => a + b, 0);
                      if (agg === "avg")   value = vals.length ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : 0;
                      if (agg === "min")   value = Math.min(...vals);
                      if (agg === "max")   value = Math.max(...vals);
                      if (agg === "count") value = data.length;
                    }
                  }

                  return (
                    <td
                      key={column.id}
                      className="px-4 py-2 text-sm"
                      style={{
                        ...(column.columnDef.meta?.sticky && {
                          position: "sticky",
                          [column.columnDef.meta.sticky]: 0,
                          background: "hsl(var(--muted))",
                          zIndex: 1,
                        }),
                      }}
                    >
                      {value !== "" ? (
                        <span className="font-semibold">{value}</span>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          )}
        </Table>
      </div>

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