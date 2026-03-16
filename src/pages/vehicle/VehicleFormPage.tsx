// src/pages/vehicle/VehicleFormPage.tsx
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import { AppForm } from "@/components/form";
import type { FormGroupDef } from "@/components/form";
import { carService } from "@/api/carService";
import type { VehicleRead } from "@/types/vehicle";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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

type VehicleFormData = z.infer<typeof vehicleSchema>;

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
        required: true,
        colSpan: 6,
      },
      {
        name: "model_name",
        label: "Model",
        type: "text",
        required: true,
        colSpan: 4,
      },
      {
        name: "year",
        label: "Yıl",
        type: "number",
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
          { label: "Test Şubesi",   value: "Test" },
          { label: "Test2 Şubesi",  value: "Test2" },
          { label: "Test3 Şubesi",  value: "Test3" },
        ],
      },
      {
        name: "status_name",
        label: "Durum",
        type: "select",
        required: true,
        colSpan: 6,
        options: [
          { label: "Müsait",       value: "Available" },
          { label: "Kirada",       value: "Rented" },
          { label: "Rezerve",      value: "Reserved" },
          { label: "Bakımda",      value: "Maintenance" },
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
        placeholder: "Araç hakkında ek notlar...xxx",
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

// ── Sayfa bileşeni ────────────────────────────────────────────────────────────
export default function VehicleFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [defaultValues, setDefaultValues] = useState<Partial<VehicleFormData>>(
    { is_active: true }
  );

  // Düzenleme modunda mevcut veriyi çek
  const fetchVehicle = useCallback(async () => {
    if (!id) return;
    try {
      setFetchLoading(true);
      const data: VehicleRead = await carService.getCarById(Number(id));
      setDefaultValues({
        name:          data.name,
        plate_number:  data.plate_number,
        year:          data.year,
        branch_name:   data.branch_name,
        category_name: data.category_name,
        model_name:    data.model_name,
        status_name:   data.status_name,
        is_active:     true,
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: "Araç bilgileri yüklenemedi.",
      });
      navigate("/araclar");
    } finally {
      setFetchLoading(false);
    }
  }, [id, navigate, toast]);

  useEffect(() => {
    fetchVehicle();
  }, [fetchVehicle]);

  // Form gönderme
  const handleSubmit = async (data: VehicleFormData) => {
    try {
      setLoading(true);
      if (isEdit) {
        await carService.updateCar(Number(id), data);
        toast({ title: "Başarılı!", description: "Araç güncellendi." });
      } else {
        await carService.createCar(data);
        toast({ title: "Başarılı!", description: "Araç oluşturuldu." });
      }
      navigate("/araclar");
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

  // Alan değişikliği izleme örneği
  const handleChange = (field: string, value: unknown) => {
    console.log("Alan değişti:", field, value);
    // Örnek: branch_name değişince status_name'i sıfırla
    // form.setValue("status_name", "");
  };

  if (fetchLoading) {
    return (
      <div className="container mx-auto py-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-5xl">
      {/* Başlık */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/araclar")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEdit ? "Araç Düzenle" : "Yeni Araç"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEdit
              ? "Mevcut araç bilgilerini güncelleyin"
              : "Sisteme yeni araç ekleyin"}
          </p>
        </div>
      </div>

      {/* Form */}
      <AppForm<VehicleFormData>
        schema={vehicleSchema}
        defaultValues={defaultValues as VehicleFormData}
        groups={formGroups}
        mode={isEdit ? "edit" : "create"}
        loading={loading}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/araclar")}
        onChange={handleChange}
        onError={(errors) => {
          console.log("Form hataları:", errors);
          toast({
            variant: "destructive",
            title: "Eksik alanlar var",
            description: "Lütfen zorunlu alanları doldurunuz.",
          });
        }}
      />
    </div>
  );
}
