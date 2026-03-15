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
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface DataGridFiltersProps<TData> {
  table: Table<TData>;
}

// Tek bir sütun filtresi
export function ColumnFilter<TData>({ column }: { column: Column<TData, unknown> }) {
  const columnFilterValue = column.getFilterValue();

  const uniqueValues = column.getFacetedUniqueValues();
  const sortedUniqueValues: string[] = Array.from(uniqueValues.keys())
    .map((value) => String(value))
    .sort();

  // Benzersiz değer sayısı 10'dan azsa → Select (dropdown)
  if (sortedUniqueValues.length > 0 && sortedUniqueValues.length <= 10) {
    return (
      <Select
        value={(columnFilterValue as string) ?? "all"}
        onValueChange={(value) =>
          column.setFilterValue(value === "all" ? undefined : value)
        }
      >
        <SelectTrigger className="!h-6 text-xs w-full min-w-0">
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
    );
  }

  const hasFilterValue =
    columnFilterValue !== undefined &&
    columnFilterValue !== null &&
    columnFilterValue !== "";

  // Text input filtre
  return (
    <div className="relative">
      <Input
        type="text"
        value={(columnFilterValue as string) ?? ""}
        onChange={(e) => column.setFilterValue(e.target.value || undefined)}
        placeholder="Filtre..."
        className="!h-6 text-xs w-full min-w-0 pr-5"
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
export function NumberRangeFilter<TData>({
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
        className="!h-6 text-xs w-full min-w-0"
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
        className="!h-6 text-xs w-full min-w-0"
      />
    </div>
  );
}

// Boolean filtresi (Evet/Hayır)
export function BooleanFilter<TData>({
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
      <SelectTrigger className="!h-6 text-xs w-full min-w-0">
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
export function DateRangeFilter<TData>({
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
        className="!h-6 text-xs w-full min-w-0"
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
        className="!h-6 text-xs w-full min-w-0"
      />
    </div>
  );
}

// Ana filtre chip'leri bileşeni
export function DataGridFilters<TData>({ table }: DataGridFiltersProps<TData>) {
  const activeFilters = table.getState().columnFilters;

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 py-1">
      <span className="text-xs text-muted-foreground">Filtreler:</span>

      {activeFilters.map((filter) => {
        const column = table.getColumn(filter.id);
        const label = column?.columnDef.meta?.label ?? filter.id;
        const value = Array.isArray(filter.value)
          ? (filter.value as (string | number | undefined)[])
              .filter(Boolean)
              .join(" – ")
          : String(filter.value);

        return (
          <Badge
            key={filter.id}
            variant="secondary"
            className="flex items-center gap-1 px-2 py-0.5 text-xs"
          >
            <span className="font-medium">{label}:</span>
            <span>{value}</span>
            <button
              onClick={() => column?.setFilterValue(undefined)}
              className="ml-1 rounded-full hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        );
      })}

      <Button
        variant="ghost"
        size="sm"
        className="h-6 text-xs text-muted-foreground"
        onClick={() => table.resetColumnFilters()}
      >
        Tümünü temizle
      </Button>
    </div>
  );
}