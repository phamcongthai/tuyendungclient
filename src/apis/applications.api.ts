import { http as axiosInstance } from './http';

export type ApplyPayload = {
  jobId: string;
  note?: string;
  resumeUrl?: string;
};

export const applicationsAPI = {
  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axiosInstance.post('/applications/upload-resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data as { url: string; downloadUrl?: string };
  },
  apply: async (payload: ApplyPayload) => {
    const res = await axiosInstance.post('/applications', payload);
    return res.data;
  },
};


