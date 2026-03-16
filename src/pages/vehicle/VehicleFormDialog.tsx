// src/components/vehicle/VehicleFormDialog.tsx
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import { AppForm } from "@/components/form";
import type { FormGroupDef } from "@/components/form";
import { carService } from "@/api/carService";
import type { VehicleRead } from "@/types/vehicle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState } from "react";

// ── Zod şeması ────────────────────────────────────────────────────────────────
const vehicleSchema = z.object({
  name:          z.string().min(1, "İsim zorunludur"),
  plate_number:  z.string().min(5, "Geçerli bir plaka giriniz"),
  year:          z.coerce.number().min(1990).max(new Date().getFullYear() + 1),
  branch_name:   z.string().min(1, "Şube seçiniz"),
  category_name: z.string().min(1, "Kategori seçiniz"),
  model_name:    z.string().min(1, "Model giriniz"),
  status_name:   z.string().min(1, "Durum seçiniz"),
  notes:         z.string().optional(),
  is_active:     z.boolean().default(true),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;

// ── Form grupları ─────────────────────────────────────────────────────────────
const formGroups: FormGroupDef<VehicleFormData>[] = [
  {
    title: "Araç Bilgileri",
    description: "Temel araç tanımlama bilgileri",
    columns: 2,
    fields: [
      {
        name: "name",
        label: "Araç İsmi",
        type: "text",
        required: true,
        colSpan: 6,
      },
      {
        name: "plate_number",
        label: "Plaka",
        type: "text",
        placeholder: "34 ABC 01",
        required: true,
        colSpan: 6,
      },
      {
        name: "model_name",
        label: "Model",
        type: "text",
        placeholder: "Corolla",
        required: true,
        colSpan: 4,
      },
      {
        name: "year",
        label: "Yıl",
        type: "number",
        placeholder: "2022",
        required: true,
        colSpan: 4,
      },
      {
        name: "category_name",
        label: "Kategori",
        type: "select",
        required: true,
        colSpan: 4,
        options: [
          { label: "Economy",   value: "Economy" },
          { label: "Compact",   value: "Compact" },
          { label: "Sedan",     value: "Sedan" },
          { label: "SUV",       value: "SUV" },
          { label: "Premium",   value: "Premium" },
          { label: "Luxury",    value: "Luxury" },
        ],
      },
    ],
  },
  {
    title: "Konum & Durum",
    columns: 2,
    fields: [
      {
        name: "branch_name",
        label: "Şube",
        type: "select",
        required: true,
        colSpan: 6,
        options: [
          { label: "Test Şubesi",  value: "Test" },
          { label: "Test2 Şubesi", value: "Test2" },
          { label: "Test3 Şubesi", value: "Test3" },
        ],
      },
      {
        name: "status_name",
        label: "Durum",
        type: "select",
        required: true,
        colSpan: 6,
        options: [
          { label: "Müsait",  value: "Available" },
          { label: "Kirada",  value: "Rented" },
          { label: "Rezerve", value: "Reserved" },
          { label: "Bakımda", value: "Maintenance" },
        ],
      },
    ],
  },
  {
    title: "Ek Bilgiler",
    collapsible: true,
    defaultCollapsed: true,
    columns: 1,
    fields: [
      {
        name: "notes",
        label: "Notlar",
        type: "textarea",
        placeholder: "Araç hakkında ek notlar...",
        colSpan: 12,
      },
      {
        name: "is_active",
        label: "Aktif araç",
        type: "switch",
        description: "Pasif araçlar listede gösterilmez",
        colSpan: 12,
      },
    ],
  },
];

// ── Props ─────────────────────────────────────────────────────────────────────
interface VehicleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle?: VehicleRead;
  onSuccess?: () => void;
}

// ── Bileşen ───────────────────────────────────────────────────────────────────
export function VehicleFormDialog({
  open,
  onOpenChange,
  vehicle,
  onSuccess,
}: VehicleFormDialogProps) {
  const { toast } = useToast();
  const isEdit = !!vehicle;
  const [loading, setLoading] = useState(false);

  // Düzenleme modunda araç verisini forma doldur,
  // yeni araçta boş bırak
  const defaultValues: Partial<VehicleFormData> = isEdit
    ? {
        name:          vehicle.name,
        plate_number:  vehicle.plate_number,
        year:          vehicle.year,
        branch_name:   vehicle.branch_name,
        category_name: vehicle.category_name,
        model_name:    vehicle.model_name,
        status_name:   vehicle.status_name,
        is_active:     true,
      }
    : { is_active: true };

  // Form gönderme
  const handleSubmit = async (data: VehicleFormData) => {
    try {
      setLoading(true);
      if (isEdit) {
        await carService.updateCar(vehicle.id, data);
        toast({ title: "Başarılı!", description: "Araç güncellendi." });
      } else {
        await carService.createCar(data);
        toast({ title: "Başarılı!", description: "Araç oluşturuldu." });
      }
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: "İşlem sırasında hata oluştu.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Araç Düzenle" : "Yeni Araç Ekle"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Mevcut araç bilgilerini güncelleyin."
              : "Sisteme yeni araç ekleyin."}
          </DialogDescription>
        </DialogHeader>

        <AppForm<VehicleFormData>
          schema={vehicleSchema}
          defaultValues={defaultValues as VehicleFormData}
          groups={formGroups}
          mode={isEdit ? "edit" : "create"}
          loading={loading}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          onError={() => {
            toast({
              variant: "destructive",
              title: "Eksik alanlar var",
              description: "Lütfen zorunlu alanları doldurunuz.",
            });
          }}
        />
      </DialogContent>
    </Dialog>
  );
}