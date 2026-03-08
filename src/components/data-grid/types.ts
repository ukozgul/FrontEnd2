// src/components/data-grid/types.ts
import { type ColumnDef } from "@tanstack/react-table";
import { type ReactNode } from "react";

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

  // ✅ Seçim
  selectionMode?: SelectionMode;
  selectedRows?: TData[];
  onSelectionChange?: (selectedRows: TData[]) => void;
  rowKey?: keyof TData;

  // ✅ Drag & Drop Sıralama
  draggable?: boolean;
  onReorder?: (newData: TData[]) => void;

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
}