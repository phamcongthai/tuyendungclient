import { http as axiosInstance } from './http';

export type PublicBlog = {
  _id?: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImageUrl: string;
  tags?: string[];
  publishedAt?: string;
  createdAt?: string;
};

export const publicBlogsApi = {
  list: async (params?: { page?: number; limit?: number; keyword?: string; tag?: string }): Promise<{ items: PublicBlog[]; total: number; page: number; limit: number }> => {
    const res = await axiosInstance.get('/blogs', { params });
    return res.data as any;
  },
  getBySlug: async (slug: string): Promise<PublicBlog> => {
    const res = await axiosInstance.get(`/blogs/${slug}`);
    return res.data as any;
  }
};


