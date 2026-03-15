// src/components/data-grid/types.ts

import { type ColumnDef, type RowData } from "@tanstack/react-table";
import { type ReactNode } from "react";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    label?: string;
    sticky?: "left" | "right";
  }
}

// Context Menu Item tipi
export interface ContextMenuItem<TData> {
  label: string;
  icon?: ReactNode;
  onClick: (row: TData) => void;
  visible?: (row: TData) => boolean;
  disabled?: (row: TData) => boolean;
  variant?: "default" | "destructive";
  separator?: boolean;
}

// Seçim modu tipi
export type SelectionMode = "none" | "single" | "multiple";

export interface DataGridProps<TData> {
  // Zorunlu
  data: TData[];
  columns: ColumnDef<TData, any>[];

  // Sayfalama
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];

  // Özellikler
  searchable?: boolean;
  searchPlaceholder?: string;
  sortable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  exportFileName?: string;

  // Seçim
  selectionMode?: SelectionMode;

  // Aksiyonlar
  onRowClick?: (row: TData) => void;
  onRowDoubleClick?: (row: TData) => void;

  // Context Menu
  contextMenuItems?: ContextMenuItem<TData>[];

  // Toolbar
  toolbarActions?: ReactNode;
  title?: string;

  // Durum
  loading?: boolean;
  emptyMessage?: string;

  // Server-side
  totalCount?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  serverSide?: boolean;

  // Satır stilleri
  rowClassName?: (row: TData) => string | undefined;
  rowStyle?: (row: TData) => React.CSSProperties | undefined;

  // Satır genişletme
  expandable?: boolean;
  expandedRowRender?: (row: TData) => React.ReactNode;

  // Kolon sürükleme
  columnReorder?: boolean;
  onColumnReorder?: (columnOrder: string[]) => void;

  // Satır sürükleme
  rowDraggable?: boolean;
  onRowReorder?: (newData: TData[]) => void;

  // Özet satırı
  summaryRow?:
    | Partial<Record<keyof TData, "sum" | "avg" | "min" | "max" | "count">>
    | ((data: TData[]) => Partial<Record<keyof TData, string | number>>);

  // Kolon resize
  columnResizable?: boolean;

  // Klavye navigasyonu
  keyboardNavigation?: boolean;
}