import { http as axiosInstance } from './http';
import type { JobData } from '../types/models';

// use shared axios instance with interceptors

// Lấy danh sách jobs
export const fetchJobs = async ({
  page = 1,
  limit = 10,
  search = '',
  jobType,
  level,
  category,
  categories,
  location,
  salaryMin,
  salaryMax,
  experience,
}: {
  page?: number;
  limit?: number;
  search?: string;
  jobType?: string;
  level?: string;
  category?: string; // single category
  categories?: string[]; // multiple categories
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  experience?: string;
}) => {
  try {
    const res = await axiosInstance.get<{ data: JobData[]; total: number }>('/jobs', {
      params: { page, limit, search, jobType, level, category, categories, location, salaryMin, salaryMax, experience },
    });

    // Log chi tiết dữ liệu trả về
    console.log('📦 API Response /jobs:', res);
    console.log('📊 Jobs data:', res.data.data);
    console.log('📈 Total jobs:', res.data.total);

    return res.data;
  } catch (error) {
    console.error('❌ Lỗi khi fetchJobs:', error);
    throw error;
  }
};

// Lấy chi tiết 1 job theo ID (public)
export const fetchJobDetail = async (slug: string) => {
  try {
    const res = await axiosInstance.get<JobData>(`/jobs/${slug}`);
    console.log('📦 API Response /jobs/:slug:', res);
    return res.data;
  } catch (error) {
    console.error('❌ Lỗi khi fetchJobDetail:', error);
    throw error;
  }
};

// Companies - public
export const fetchCompanyById = async (id: string) => {
  try {
    const res = await axiosInstance.get(`/companies/id/${id}`);
    return res.data as {
      _id: string;
      name: string;
      slug: string;
      logo?: string;
      size?: string | number;
      location?: string;
      description?: string;
    };
  } catch (error) {
    console.error('❌ Lỗi khi fetchCompanyById:', error);
    throw error;
  }
};

export const fetchFeaturedCategories = async () => {
  try {
    const res = await axiosInstance.get('/job-categories', { params: { status: 'active' } });
    // Expect backend to return: { data: [{ _id, title, slug, logo?, jobCount }], total }
    return res.data as { data: Array<{ _id: string; title: string; slug: string; logo?: string; jobCount: number }>; total: number };
  } catch (error) {
    console.error('❌ Lỗi khi fetchFeaturedCategories:', error);
    throw error;
  }
}