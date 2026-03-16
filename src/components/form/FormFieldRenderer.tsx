// src/components/form/FormField.tsx
import { type FieldValues, useFormContext, useWatch } from "react-hook-form";
import type { FormFieldDef } from "./types";
import { TextField } from "./fields/TextField";
import { SelectField } from "./fields/SelectField";
import { CheckboxField } from "./fields/CheckboxField";
import { DateField } from "./fields/DateField";
import { cn } from "@/lib/utils";

const colSpanClass: Record<number, string> = {
  1:  "col-span-1",
  2:  "col-span-2",
  3:  "col-span-3",
  4:  "col-span-4",
  6:  "col-span-6",
  12: "col-span-12",
};

export function FormFieldRenderer<TData extends FieldValues>({
  def,
}: {
  def: FormFieldDef<TData>;
}) {
  const form = useFormContext<TData>();

  // Alan bağımlılığı — dependsOn varsa kontrol et
  const dependsOnValue = useWatch({
    control: form.control,
    name: def.dependsOn?.field as string,
    disabled: !def.dependsOn,
  });

  if (def.hidden) return null;

  if (def.dependsOn && dependsOnValue !== def.dependsOn.value) {
    return null;
  }

  const colClass = colSpanClass[def.colSpan ?? 6] ?? "col-span-6";

  const renderField = () => {
    // Özel render varsa kullan
    if (def.render) return def.render(form);

    switch (def.type) {
      case "select":
        return <SelectField def={def} />;

      case "checkbox":
      case "switch":
        return <CheckboxField def={def} />;

      case "date":
        return <DateField def={def} />;

      case "text":
      case "number":
      case "email":
      case "password":
      case "textarea":
      default:
        return <TextField def={def} />;
    }
  };

  return (
    <div className={cn(colClass)}>
      {renderField()}
    </div>
  );
}
