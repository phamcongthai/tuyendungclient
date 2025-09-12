import { http as axiosInstance } from './http';

export interface CVBuilderData {
  cvId: string;
  cvFields: any;
}

export interface CVTemplate {
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

export const cvBuilderAPI = {
  // Lấy danh sách mẫu CV đang hoạt động
  async getTemplates(): Promise<CVTemplate[]> {
    const res = await axiosInstance.get('/cv-builder/templates');
    return res.data;
  },

  // Lấy chi tiết mẫu CV
  async getTemplate(id: string): Promise<CVTemplate> {
    const res = await axiosInstance.get(`/cv-builder/templates/${id}`);
    return res.data;
  },

  // Lưu CV của người dùng
  async saveCv(data: CVBuilderData) {
    const res = await axiosInstance.post('/cv-builder/save', data);
    return res.data;
  },

  // Cập nhật CV của người dùng
  async updateCv(data: CVBuilderData) {
    const res = await axiosInstance.put('/cv-builder/update', data);
    return res.data;
  },

  // Lấy CV của người dùng hiện tại
  async getUserCv() {
    const res = await axiosInstance.get('/cv-builder/user-cv');
    return res.data;
  },

  // Xóa CV của người dùng
  async deleteCv() {
    const res = await axiosInstance.delete('/cv-builder/delete');
    return res.data;
  },

  // Render CV hoàn chỉnh của người dùng
  async renderUserCv(userId: string) {
    const res = await axiosInstance.get(`/cv-builder/render/${userId}`);
    return res.data;
  }
};
