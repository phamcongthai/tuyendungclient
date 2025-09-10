import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false,
});

export interface CVSampleData {
  _id: string;
  name: string;
  title: string;
  description?: string;
  demoImage?: string;
  html: string;
  css: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Lấy danh sách CV samples đang hoạt động
export const fetchActiveCVSamples = async (): Promise<CVSampleData[]> => {
  const res = await axiosInstance.get<CVSampleData[]>('/cv-samples/active');
  return res.data;
};

// Lấy chi tiết CV sample
export const fetchCVSampleById = async (id: string): Promise<CVSampleData> => {
  const res = await axiosInstance.get<CVSampleData>(`/cv-samples/${id}`);
  return res.data;
};
