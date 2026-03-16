// src/api/carService.ts
import apiClient from './apiCilent';
import type { VehicleRead, ApiResponse } from '@/types/vehicle';

export const carService = {
  // 🔹 TÜM ARAÇLARI GETİR
  getAllCars: async (): Promise<VehicleRead[]> => {
    const response = await apiClient.get<VehicleRead[]>('/Vehicle');
    return response.data;
  },

  // 🔹 ID'SİNE GÖRE ARAÇ GETİR
  getCarById: async (id: number): Promise<VehicleRead> => {
    const response = await apiClient.get<ApiResponse<VehicleRead>>(`/Vehicle/${id}`);
    return response.data.data;
  },

  // 🔹 YENİ ARAÇ EKLE
  createCar: async (carData: Partial<VehicleRead>): Promise<VehicleRead> => {
    const response = await apiClient.post<ApiResponse<VehicleRead>>('/Vehicle', carData);
    return response.data.data;
  },

  // 🔹 ARAÇ GÜNCELLE
  updateCar: async (id: number, carData: Partial<VehicleRead>): Promise<VehicleRead> => {
    const response = await apiClient.put<ApiResponse<VehicleRead>>(`/Vehicle/${id}`, carData);
    return response.data.data;
  },

  // 🔹 ARAÇ SİL
  deleteCar: async (id: number): Promise<void> => {
    await apiClient.delete(`/Vehicle/${id}`);
  },
};