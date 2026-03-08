// src/pages/cars/CarsPage.tsx
import { useEffect, useState } from 'react';
import { carService } from '@/api/carService';
import { Button } from '@/components/ui/button';
import { Copy, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import type { VehicleRead } from '@/types/vehicle';
import type { ContextMenuItem } from '@/components/data-grid/types';
import { DataGrid } from '@/components/data-grid/DataGrid';


export default function CarsPage() {
  const [cars, setCars] = useState<VehicleRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();


  // 🔹 VERİYİ ÇEK
  const fetchCars = async () => {
    try {
      setLoading(true);
      const data = await carService.getAllCars();
      setCars(data);
      setError(null);
    } catch (err) {
      console.error('Araçlar yüklenemedi:', err);
      setError('Araç verileri yüklenirken hata oluştu.');
      toast({
        variant: 'destructive',
        title: 'Hata!',
        description: 'Araç listesi getirilemedi.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Sayfa açılır açılmaz veriyi çek
  useEffect(() => {
    fetchCars();
  }, []);

  // 🔹 ARAÇ SİLME
  // const handleDelete = async (id: number) => {
  //   if (!confirm('Bu aracı silmek istediğinize emin misiniz?')) return;

  //   try {
  //     await carService.deleteCar(id);

  //     // State’ten sil
  //     setCars((prev) => prev.filter((car) => car.id !== id));

  //     toast({
  //       title: 'Başarılı!',
  //       description: 'Araç başarıyla silindi.',
  //     });
  //   } catch (err) {
  //     toast({
  //       variant: 'destructive',
  //       title: 'Hata!',
  //       description: 'Araç silinemedi.',
  //     });
  //   }
  // };

  // 🔹 DATAGRID SÜTUNLARI
  const columns = [
    { accessorKey: 'branch_name', header: 'Şube', },
    { accessorKey: 'category_name', header: 'Kategori', },
    { accessorKey: 'model_name', header: 'Model', },
    { accessorKey: 'name', header: 'İsim', },
    { accessorKey: 'plate_number', header: 'Plaka', },
    { accessorKey: 'status_name', header: 'Durum', },
    { accessorKey: 'year', header: 'Yıl', },
    // 🔸 İŞLEMLER SÜTUNU
    { id: 'actions', header: 'İşlemler', },
  ];

  // ✅ SAĞ TIK MENÜSÜ
  const contextMenuItems: ContextMenuItem<VehicleRead>[] = [
    {
      label: "Detay Görüntüle",
      icon: <Eye className="h-4 w-4" />,
      onClick: (vehicle) => {
        console.log("Detay:", vehicle);
      },
    },
    {
      label: "Düzenle",
      icon: <Pencil className="h-4 w-4" />,
      onClick: (vehicle) => {
        console.log("Düzenle:", vehicle);
      },
      separator: true,
    },
    {
      label: "Plakayı Kopyala",
      icon: <Copy className="h-4 w-4" />,
      onClick: (vehicle) => {
        navigator.clipboard.writeText(vehicle.plate_number);
      },
    },
    {
      label: "Sil",
      icon: <Trash2 className="h-4 w-4" />,
      variant: "destructive",
      onClick: (vehicle) => {
        console.log("Sil:", vehicle);
      },
      disabled: (vehicle) => vehicle.status_name === "kirada", // Kiradaki araç silinemez
    },
  ];

  // 🔹 HATA GÖSTER
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
      {/* BAŞLIK + YENİ ARAÇ BUTONU */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Araç Listesi</h1>

        <Button asChild>
          <Link to="/cars/new">
            <Plus className="mr-2 h-4 w-4" /> Yeni Araç
          </Link>
        </Button>
      </div>

      {/* DATAGRID */}
      <DataGrid
        data={cars}
        columns={columns}
        loading={loading}
        contextMenuItems={contextMenuItems}
        selectionMode='multiple'
        pagination
        pageSize={10}
        pageSizeOptions={[10, 20, 50]}
        searchable
        searchPlaceholder="Araç ara (marka, model, plaka)..."
        emptyMessage="Sistemde kayıtlı araç bulunmuyor."
      />
    </div>
  );
}