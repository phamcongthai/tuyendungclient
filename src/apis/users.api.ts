import { http as axiosInstance } from './http';

export const usersAPI = {
  async getMe() {
    const res = await axiosInstance.get('/users/me');
    return res.data;
  },
  async updateMe(payload: any) {
    const res = await axiosInstance.patch('/users/me', payload);
    return res.data;
  },
  async uploadAvatar(file: File) {
    const form = new FormData();
    form.append('file', file);
    const res = await axiosInstance.post('/users/me/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  async deleteCv() {
    const res = await axiosInstance.delete('/users/me/cv');
    return res.data;
  }
}


