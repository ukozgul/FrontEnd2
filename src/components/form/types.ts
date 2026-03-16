// src/components/form/types.ts
import type { ReactNode } from "react";
import type {
  FieldValues,
  Path,
  UseFormReturn,
  DefaultValues,
} from "react-hook-form";
import type { ZodType } from "zod";

// Alan tipleri
export type FieldType =
  | "text"
  | "number"
  | "email"
  | "password"
  | "textarea"
  | "select"
  | "multiselect"
  | "date"
  | "daterange"
  | "checkbox"
  | "switch"
  | "radio"
  | "file";

// Select seçeneği
export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

// Tek alan tanımı
export interface FormFieldDef<TData extends FieldValues> {
  name: Path<TData>;
  label?: string;
  type?: FieldType;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  hidden?: boolean;
  options?: SelectOption[];
  dependsOn?: {
    field: Path<TData>;
    value: unknown;
  };
  colSpan?: 1 | 2 | 3 | 4 | 6 | 12;
  render?: (form: UseFormReturn<TData>) => ReactNode;
}

// Alan grubu tanımı
export interface FormGroupDef<TData extends FieldValues> {
  title?: string;
  description?: string;
  fields: FormFieldDef<TData>[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  columns?: 1 | 2 | 3 | 4;
}

// Ana form prop'ları
export interface AppFormProps<TData extends FieldValues> {
  // ZodSchema yerine ZodType<TData> — Zod v4 uyumlu
  schema: ZodType<TData>;
  defaultValues?: DefaultValues<TData>;
  groups?: FormGroupDef<TData>[];
  fields?: FormFieldDef<TData>[];
  mode?: "create" | "edit" | "view";
  loading?: boolean;
  onSubmit: (data: TData) => void | Promise<void>;
  onCancel?: () => void;
  onChange?: (field: Path<TData>, value: unknown) => void;
  onError?: (errors: Record<string, string>) => void;
  submitLabel?: string;
  cancelLabel?: string;
  className?: string;
}