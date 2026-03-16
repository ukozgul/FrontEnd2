// src/components/form/fields/DateField.tsx
import { type FieldValues, type ControllerRenderProps, useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { FormFieldDef } from "../types";

export function DateField<TData extends FieldValues>({
  def,
}: {
  def: FormFieldDef<TData>;
}) {
  const form = useFormContext<TData>();

  return (
    <FormField
      control={form.control}
      name={def.name}
      render={({ field }: { field: ControllerRenderProps<TData> }) => (
        <FormItem>
          {def.label && (
            <FormLabel>
              {def.label}
              {def.required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <Input
              type="date"
              disabled={def.disabled}
              readOnly={def.readOnly}
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>
          {def.description && (
            <FormDescription>{def.description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
