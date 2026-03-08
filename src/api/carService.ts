import apiClient from './apiCilent';
import type { VehicleRead,ApiResponse} from '@/types/vehicle';

export const carService = {
  // 🔹 TÜM ARAÇLARI GETİR
  getAllCars: async (): Promise<VehicleRead[]> => {
    const response = await apiClient.get<VehicleRead[]>('/Vehicle');
    return response.data; 
  },

  // 🔹 ID'SİNE GÖRE ARAÇ GETİR
  getCarById: async (id: number): Promise<VehicleRead> => {
    const response = await apiClient.get<ApiResponse<VehicleRead>>(`/cars/${id}`);
    return response.data.data;
  },

  // 🔹 YENİ ARAÇ EKLE
  addCar: async (carData: Omit<VehicleRead, 'id' | 'createdAt'>): Promise<VehicleRead> => {
    const response = await apiClient.post<ApiResponse<VehicleRead>>('/cars', carData);
    return response.data.data;
  },

  // 🔹 ARAÇ SİL
  deleteCar: async (id: number): Promise<void> => {
    await apiClient.delete(`/cars/${id}`);
  },
};