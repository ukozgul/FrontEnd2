// src/components/form/fields/SelectField.tsx
import { type FieldValues, type ControllerRenderProps, useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FormFieldDef, SelectOption } from "../types";

export function SelectField<TData extends FieldValues>({
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
          <Select
            onValueChange={field.onChange}
            value={field.value ?? ""}
            disabled={def.disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={def.placeholder ?? "Seçiniz..."} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {def.options?.map((opt: SelectOption) => (
                <SelectItem
                  key={String(opt.value)}
                  value={String(opt.value)}
                  disabled={opt.disabled}
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {def.description && (
            <FormDescription>{def.description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
