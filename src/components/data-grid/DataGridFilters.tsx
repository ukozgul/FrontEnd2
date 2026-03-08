// src/components/data-grid/DataGridFilters.tsx
import { type Table, type Column } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface DataGridFiltersProps<TData> {
  table: Table<TData>;
}

// Tek bir sütun filtresi
function ColumnFilter<TData>({ column }: { column: Column<TData, unknown> }) {
  const columnFilterValue = column.getFilterValue();

  // Sütunun benzersiz değerlerini al
  const uniqueValues = column.getFacetedUniqueValues();
  // unknown[] yerine string[] olarak dönüştür
  const sortedUniqueValues: string[] = Array.from(uniqueValues.keys())
    .map((value) => String(value))
    .sort();

  // Eğer benzersiz değer sayısı 10'dan azsa → Select (dropdown)
  // Fazlaysa → Input (text)
  if (sortedUniqueValues.length > 0 && sortedUniqueValues.length <= 10) {
    return (
      <div className="relative">
        <Select
          value={(columnFilterValue as string) ?? "all"}
          onValueChange={(value) =>
            column.setFilterValue(value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="h-7 text-xs w-full min-w-[80px]">
            <SelectValue placeholder="Tümü" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            {sortedUniqueValues.map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Filter value'nun var olup olmadığını kontrol et
  const hasFilterValue = columnFilterValue !== undefined && columnFilterValue !== null && columnFilterValue !== "";

  // Text input filtre
  return (
    <div className="relative">
      <Input
        type="text"
        value={(columnFilterValue as string) ?? ""}
        onChange={(e) => column.setFilterValue(e.target.value || undefined)}
        placeholder="Filtre..."
        className="h-7 text-xs w-full min-w-[80px]"
      />
      {hasFilterValue && (
        <button
          type="button"
          onClick={() => column.setFilterValue(undefined)}
          className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

// Sayı aralığı filtresi (min-max)
function NumberRangeFilter<TData>({
  column,
}: {
  column: Column<TData, unknown>;
}) {
  const filterValue = column.getFilterValue() as [number, number] | undefined;

  return (
    <div className="flex gap-1">
      <Input
        type="number"
        value={filterValue?.[0] ?? ""}
        onChange={(e) => {
          const val = e.target.value;
          column.setFilterValue((old: [number, number] | undefined) => [
            val ? Number(val) : undefined,
            old?.[1],
          ]);
        }}
        placeholder="Min"
        className="h-7 text-xs w-16"
      />
      <Input
        type="number"
        value={filterValue?.[1] ?? ""}
        onChange={(e) => {
          const val = e.target.value;
          column.setFilterValue((old: [number, number] | undefined) => [
            old?.[0],
            val ? Number(val) : undefined,
          ]);
        }}
        placeholder="Max"
        className="h-7 text-xs w-16"
      />
    </div>
  );
}

// Boolean filtresi (Evet/Hayır)
function BooleanFilter<TData>({
  column,
  trueLabel = "Evet",
  falseLabel = "Hayır",
}: {
  column: Column<TData, unknown>;
  trueLabel?: string;
  falseLabel?: string;
}) {
  const filterValue = column.getFilterValue();

  return (
    <Select
      value={filterValue === undefined ? "all" : String(filterValue)}
      onValueChange={(value) => {
        if (value === "all") column.setFilterValue(undefined);
        else column.setFilterValue(value === "true");
      }}
    >
      <SelectTrigger className="h-7 text-xs w-full min-w-[80px]">
        <SelectValue placeholder="Tümü" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Tümü</SelectItem>
        <SelectItem value="true">{trueLabel}</SelectItem>
        <SelectItem value="false">{falseLabel}</SelectItem>
      </SelectContent>
    </Select>
  );
}

// Tarih aralığı filtresi
function DateRangeFilter<TData>({
  column,
}: {
  column: Column<TData, unknown>;
}) {
  const filterValue = column.getFilterValue() as [string, string] | undefined;

  return (
    <div className="flex gap-1">
      <Input
        type="date"
        value={filterValue?.[0] ?? ""}
        onChange={(e) => {
          column.setFilterValue((old: [string, string] | undefined) => [
            e.target.value || undefined,
            old?.[1],
          ]);
        }}
        className="h-7 text-xs"
      />
      <Input
        type="date"
        value={filterValue?.[1] ?? ""}
        onChange={(e) => {
          column.setFilterValue((old: [string, string] | undefined) => [
            old?.[0],
            e.target.value || undefined,
          ]);
        }}
        className="h-7 text-xs"
      />
    </div>
  );
}

// Ana filtre alanı bileşeni
export function DataGridFilters<TData>({
  table,
}: DataGridFiltersProps<TData>) {
  const hasActiveFilters = table.getState().columnFilters.length > 0;

  return (
    <div className="space-y-2">
      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Aktif filtreler: {table.getState().columnFilters.length}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={() => table.resetColumnFilters()}
          >
            Tümünü Temizle
            <X className="ml-1 h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

// Dışa aktar
export { ColumnFilter, NumberRangeFilter, BooleanFilter, DateRangeFilter };