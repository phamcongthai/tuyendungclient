import { http as axiosInstance } from './http';

export type ApplyPayload = {
  jobId: string;
  coverLetter?: string;
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
  checkApplication: async (jobId: string) => {
    const res = await axiosInstance.get(`/applications/check?jobId=${jobId}`);
    return res.data;
  },
};


