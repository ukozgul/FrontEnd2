// Car modeli
export interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  pricePerDay: number;
  isAvailable: boolean;
  licensePlate: string;   // Plaka
  fuelType: 'Benzin' | 'Dizel' | 'Elektrik' | 'Hibrit';
  transmission: 'Manuel' | 'Otomatik';
  createdAt?: string;     // API'den gelen tarih
}

