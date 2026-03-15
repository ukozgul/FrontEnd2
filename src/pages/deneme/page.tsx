import { DataGrid } from "@/components/data-grid/DataGrid";
import { Button } from "@/components/ui/button";

export default function page() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Deneme Sayfası</h1>
            <DataGrid
                data={[
                    { id: 1, ad: "ali", soyad: "ak" },
                    { id: 2, ad: "veli", soyad: "kara" },
                    { id: 3, ad: "hasan", soyad: "kırmızı" },
                    { id: 4, ad: "hüseyin", soyad: "mavi" }]}
                columns={[
                    { accessorKey: 'id', header: 'No' },
                    { accessorKey: 'ad', header: 'Ad' },
                    { accessorKey: 'soyad', header: 'Soyad' },]}
                selectionMode="multiple"
                title="Kullanıclılar"
                exportable
                filterable={false}
            />
        </div>
    )
}
