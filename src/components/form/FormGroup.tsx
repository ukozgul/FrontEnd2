// src/components/form/FormGroup.tsx
import { useState } from "react";
import { type FieldValues } from "react-hook-form";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { FormFieldRenderer } from "./FormFieldRenderer";
import type { FormGroupDef } from "./types";

const gridColsClass: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

export function FormGroup<TData extends FieldValues>({
  group,
}: {
  group: FormGroupDef<TData>;
}) {
  const [collapsed, setCollapsed] = useState(
    group.defaultCollapsed ?? false
  );

  const gridClass = gridColsClass[group.columns ?? 2] ?? "grid-cols-2";

  return (
    <div className="rounded-lg border bg-card">
      {/* Grup başlığı */}
      {(group.title || group.collapsible) && (
        <div
          className={cn(
            "flex items-center justify-between px-4 py-3 border-b",
            group.collapsible && "cursor-pointer select-none hover:bg-muted/50"
          )}
          onClick={() => group.collapsible && setCollapsed((v) => !v)}
        >
          <div>
            {group.title && (
              <h3 className="text-sm font-medium">{group.title}</h3>
            )}
            {group.description && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {group.description}
              </p>
            )}
          </div>
          {group.collapsible && (
            collapsed
              ? <ChevronRight className="h-4 w-4 text-muted-foreground" />
              : <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      )}

      {/* Alanlar */}
      {!collapsed && (
        <div className={cn("grid gap-4 p-4", gridClass)}>
          {group.fields.map((field) => (
            <FormFieldRenderer key={String(field.name)} def={field} />
          ))}
        </div>
      )}
    </div>
  );
}
