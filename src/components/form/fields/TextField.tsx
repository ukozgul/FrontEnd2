// src/components/form/fields/TextField.tsx
import { type FieldValues, type ControllerRenderProps, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { FormFieldDef } from "../types";

export function TextField<TData extends FieldValues>({
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
            {def.type === "textarea" ? (
              <Textarea
                placeholder={def.placeholder}
                disabled={def.disabled}
                readOnly={def.readOnly}
                className="resize-none"
                rows={4}
                {...field}
                value={field.value ?? ""}
              />
            ) : (
              <Input
                type={def.type ?? "text"}
                placeholder={def.placeholder}
                disabled={def.disabled}
                readOnly={def.readOnly}
                {...field}
                value={field.value ?? ""}
                onChange={(e) => {
                  const val =
                    def.type === "number"
                      ? e.target.value === ""
                        ? undefined
                        : Number(e.target.value)
                      : e.target.value;
                  field.onChange(val);
                }}
              />
            )}
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
