import axios from 'axios';

// .env dosyasından base URL al
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL ="https://localhost:7204/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Hata yakalama
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('🚨 API Hatası:', error.message);
    return Promise.reject(error);
  }
);

export default apiClient;