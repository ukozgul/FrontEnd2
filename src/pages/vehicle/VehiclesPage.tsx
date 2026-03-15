// src/pages/vehicle/VehiclesPage.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { type Row } from "@tanstack/react-table";
import { carService } from "@/api/carService";
import { Button } from "@/components/ui/button";
import { Copy, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import type { VehicleRead } from "@/types/vehicle";
import type { ContextMenuItem } from "@/components/data-grid/types";
import { DataGrid } from "@/components/data-grid/DataGrid";
import { cn } from "@/lib/utils";

export default function VehiclesPage() {
  const [cars, setCars] = useState<VehicleRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCars = useCallback(async () => {
    try {
      setLoading(true);
      const data = await carService.getAllCars();
      setCars(data);
      setError(null);
    } catch (err) {
      console.error("Araçlar yüklenemedi:", err);
      setError("Araç verileri yüklenirken hata oluştu.");
      toast({
        variant: "destructive",
        title: "Hata!",
        description: "Araç listesi getirilemedi.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  // Durum badge renkleri
  const statusStyles: Record<string, string> = {
    Available:   "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    Rented:      "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    Reserved:    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    Maintenance: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  };

  const columns = useMemo(() => [
    {
      accessorKey: "branch_name",
      header: "Şube",
      size: 100,
      meta: { label: "Şube", sticky: "left" as const },
    },
    {
      accessorKey: "category_name",
      header: "Kategori",
      size: 110,
      meta: { label: "Kategori" },
    },
    {
      accessorKey: "model_name",
      header: "Model",
      size: 120,
      meta: { label: "Model" },
    },
    {
      accessorKey: "name",
      header: "İsim",
      size: 160,
      meta: { label: "İsim" },
    },
    {
      accessorKey: "plate_number",
      header: "Plaka",
      size: 110,
      meta: { label: "Plaka" },
    },
    {
      accessorKey: "status_name",
      header: "Durum",
      size: 130,
      meta: { label: "Durum" },
      cell: ({ row }: { row: Row<VehicleRead> }) => {
        const status = row.original.status_name;
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
              statusStyles[status] ?? "bg-muted text-muted-foreground"
            )}
          >
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "year",
      header: "Yıl",
      size: 80,
      meta: { label: "Yıl" },
    },
    {
      id: "actions",
      header: "İşlemler",
      size: 90,
      enableHiding: false,
      enableColumnFilter: false,
      meta: { label: "İşlemler", sticky: "right" as const },
      cell: ({ row }: { row: Row<VehicleRead> }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              console.log("Detay:", row.original);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              console.log("Düzenle:", row.original);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ], []);

  const contextMenuItems: ContextMenuItem<VehicleRead>[] = useMemo(() => [
    {
      label: "Detay Görüntüle",
      icon: <Eye className="h-4 w-4" />,
      onClick: (vehicle) => console.log("Detay:", vehicle),
    },
    {
      label: "Düzenle",
      icon: <Pencil className="h-4 w-4" />,
      onClick: (vehicle) => console.log("Düzenle:", vehicle),
      separator: true,
    },
    {
      label: "Plakayı Kopyala",
      icon: <Copy className="h-4 w-4" />,
      onClick: (vehicle) => navigator.clipboard.writeText(vehicle.plate_number),
    },
    {
      label: "Sil",
      icon: <Trash2 className="h-4 w-4" />,
      variant: "destructive",
      onClick: (vehicle) => console.log("Sil:", vehicle),
      disabled: (vehicle) => vehicle.status_name === "Rented",
    },
  ], []);

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchCars}>Tekrar Dene</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Araç Listesi</h1>
        <Button asChild>
          <Link to="/cars/new">
            <Plus className="mr-2 h-4 w-4" /> Yeni Araç
          </Link>
        </Button>
      </div>

      <DataGrid
        data={cars}
        columns={columns}
        loading={loading}
        contextMenuItems={contextMenuItems}
        selectionMode="multiple"
        pagination
        pageSize={10}
        pageSizeOptions={[10, 20, 50]}
        searchable
        searchPlaceholder="Araç ara (marka, model, plaka)..."
        exportable
        exportFileName="araclar"
        emptyMessage="Sistemde kayıtlı araç bulunmuyor."

        // Satır renklendirme
        rowClassName={(vehicle) => {
          if (vehicle.status_name === "Rented")      return "bg-blue-50/50 dark:bg-blue-950/20";
          if (vehicle.status_name === "Reserved")    return "bg-yellow-50/50 dark:bg-yellow-950/20";
          if (vehicle.status_name === "Maintenance") return "bg-red-50/50 dark:bg-red-950/20";
        }}

        // Satır genişletme
        // expandable
        // expandedRowRender={(vehicle) => (
        //   <div className="grid grid-cols-4 gap-4 text-sm">
        //     <div>
        //       <span className="font-medium text-muted-foreground">Şube: </span>
        //       <span>{vehicle.branch_name}</span>
        //     </div>
        //     <div>
        //       <span className="font-medium text-muted-foreground">Kategori: </span>
        //       <span>{vehicle.category_name}</span>
        //     </div>
        //     <div>
        //       <span className="font-medium text-muted-foreground">Model: </span>
        //       <span>{vehicle.model_name}</span>
        //     </div>
        //     <div>
        //       <span className="font-medium text-muted-foreground">Durum: </span>
        //       <span>{vehicle.status_name}</span>
        //     </div>
        //   </div>
        // )}

        // Kolon sürükleme
        columnReorder
        onColumnReorder={(order) => console.log("Yeni kolon sırası:", order)}

        // Satır sürükleme
        // rowDraggable
        // onRowReorder={(newData) => setCars(newData)}

        // Özet satırı
        summaryRow={{
          year: "avg",
        }}

        // Kolon resize
        columnResizable

        // Klavye navigasyonu
        keyboardNavigation
      />
    </div>
  );
}