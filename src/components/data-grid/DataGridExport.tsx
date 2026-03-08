// src/components/data-grid/DataGridExport.tsx
import { type Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from "xlsx";

interface DataGridExportProps<TData> {
  table: Table<TData>;
  data: TData[];
  fileName?: string;
}

export function DataGridExport<TData>({
  table,
  data,
  fileName = "data",
}: DataGridExportProps<TData>) {
  const getExportData = () => {
    const visibleColumns = table
      .getAllColumns()
      .filter((col) => col.getIsVisible() && col.id !== "select" && col.id !== "actions");

    const headers = visibleColumns.map((col) => col.id);

    const rows = table.getFilteredRowModel().rows.map((row) => {
      const rowData: Record<string, any> = {};
      visibleColumns.forEach((col) => {
        rowData[col.id] = row.getValue(col.id);
      });
      return rowData;
    });

    return { headers, rows };
  };

  const exportToExcel = () => {
    const { rows } = getExportData();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const exportToCSV = () => {
    const { rows } = getExportData();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.csv`;
    link.click();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Dışa Aktar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={exportToExcel}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToCSV}>
          <FileText className="mr-2 h-4 w-4" />
          CSV (.csv)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}