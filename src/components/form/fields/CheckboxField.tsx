// src/components/form/fields/CheckboxField.tsx
import { type FieldValues, type ControllerRenderProps, useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import type { FormFieldDef } from "../types";

export function CheckboxField<TData extends FieldValues>({
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
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
          <FormControl>
            {def.type === "switch" ? (
              <Switch
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
                disabled={def.disabled}
              />
            ) : (
              <Checkbox
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
                disabled={def.disabled}
              />
            )}
          </FormControl>
          <div className="space-y-1 leading-none">
            {def.label && (
              <FormLabel className="cursor-pointer">{def.label}</FormLabel>
            )}
            {def.description && (
              <FormDescription>{def.description}</FormDescription>
            )}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
