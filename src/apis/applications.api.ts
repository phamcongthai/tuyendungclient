import { http as axiosInstance } from './http';

export type ApplyPayload = {
  jobId: string;
  coverLetter?: string;
};

export type ApplicationStatus =
  | 'pending'
  | 'viewed'
  | 'shortlisted'
  | 'accepted'
  | 'rejected'
  | 'withdrawn'
  | 'interviewed'
  | 'interview_failed';

export type ApplicationItem = {
  _id: string;
  jobId: { _id: string; title?: string; slug?: string } | string;
  status: ApplicationStatus;
  note?: string | null;
  coverLetter?: string | null;
  createdAt: string;
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
  listByUser: async (params: { userId: string; page?: number; limit?: number }) => {
    const { userId, page = 1, limit = 12 } = params;
    const res = await axiosInstance.get(`/applications`, {
      params: { userId, page, limit },
    });
    return res.data as { data: ApplicationItem[]; total: number };
  },
  withdraw: async (applicationId: string) => {
    const res = await axiosInstance.patch(`/applications/${applicationId}/withdraw`);
    return res.data;
  },
};


