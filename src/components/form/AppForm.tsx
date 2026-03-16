// src/components/form/AppForm.tsx
import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type FieldValues } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FormGroup } from "./FormGroup";
import { FormFieldRenderer } from "./FormFieldRenderer";
import type { AppFormProps, FormGroupDef, FormFieldDef } from "./types";

export function AppForm<TData extends FieldValues>({
  schema,
  defaultValues,
  groups,
  fields,
  mode = "create",
  loading = false,
  onSubmit,
  onCancel,
  onChange,
  onError,
  submitLabel,
  cancelLabel = "İptal",
  className,
}: AppFormProps<TData>) {
  const isViewMode = mode === "view";

  const form = useForm<TData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    defaultValues,
    mode: "onChange",
  });

  // Alan değişikliklerini dinle
  useEffect(() => {
    if (!onChange) return;
    const subscription = form.watch((value, { name }) => {
      if (name) onChange(name as typeof name, value[name]);
    });
    return () => subscription.unsubscribe();
  }, [form, onChange]);

  const handleSubmit = form.handleSubmit(
    async (data) => {
      await onSubmit(data);
    },
    (errors) => {
      if (onError) {
        const flat: Record<string, string> = {};
        Object.entries(errors).forEach(([key, val]) => {
          if (val?.message) flat[key] = val.message as string;
        });
        onError(flat);
      }
    }
  );

  const submitText =
    submitLabel ?? (mode === "edit" ? "Güncelle" : "Kaydet");

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit}
        className={cn("space-y-4", className)}
        noValidate
      >
        {/* Grup bazlı layout */}
        {groups?.map((group: FormGroupDef<TData>, i: number) => (
          <FormGroup key={i} group={group} />
        ))}

        {/* Düz liste layout */}
        {fields && !groups && (
          <div className="rounded-lg border bg-card p-4">
            <div className="grid grid-cols-2 gap-4">
              {fields.map((field: FormFieldDef<TData>) => (
                <FormFieldRenderer key={String(field.name)} def={field} />
              ))}
            </div>
          </div>
        )}

        {/* Butonlar */}
        {!isViewMode && (
          <div className="flex items-center justify-end gap-2 pt-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                {cancelLabel}
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitText}
            </Button>
          </div>
        )}
      </form>
    </FormProvider>
  );
}