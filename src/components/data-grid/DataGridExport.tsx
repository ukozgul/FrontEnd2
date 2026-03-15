// src/components/data-grid/DataGridExport.tsx
import { type Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";

interface DataGridExportProps<TData> {
  table: Table<TData>;
  data: TData[];
  fileName?: string;
}

export function DataGridExport<TData>({
  table,
  fileName = "data",
}: DataGridExportProps<TData>) {

  // Görünür kolonları ve satırları al
  const getExportData = () => {
    const visibleColumns = table
      .getVisibleLeafColumns()
      .filter((col) => col.id !== "select" && col.id !== "actions");

    const rows = table.getFilteredRowModel().rows;

    const headers = visibleColumns.map(
      (col) => (col.columnDef.meta as { label?: string })?.label ?? col.id
    );

    const exportRows = rows.map((row) =>
      visibleColumns.map((col) => {
        const cell = row.getAllCells().find((c) => c.column.id === col.id);
        const val = cell?.getValue();
        return val ?? "";
      })
    );

    return { headers, rows: exportRows };
  };

  const exportCSV = () => {
    const { headers, rows } = getExportData();
    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportExcel = () => {
    const { headers, rows } = getExportData();
    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Kolon genişliklerini otomatik ayarla
    ws["!cols"] = headers.map((h, i) => ({
      wch: Math.max(
        h.length,
        ...rows.map((r) => String(r[i] ?? "").length)
      ) + 2,
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Veri");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Dışa Aktar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportCSV}>
          CSV olarak indir
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportExcel}>
          Excel olarak indir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}