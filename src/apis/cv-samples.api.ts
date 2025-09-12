import { http as axiosInstance } from './http';

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
  const res = await axiosInstance.get<CVSampleData[]>('/public/cv-samples');
  return res.data;
};

// Lấy chi tiết CV sample
export const fetchCVSampleById = async (id: string): Promise<CVSampleData> => {
  const res = await axiosInstance.get<CVSampleData>(`/public/cv-samples/${id}`);
  return res.data;
};
