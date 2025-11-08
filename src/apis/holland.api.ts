import { http } from './http';

export interface HollandQuestion {
  _id: string;
  order: number;
  content: string;
  category: 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
  options: { label: string; value: number }[];
}

export interface HollandProfile {
  code: string;
  title: string;
  description: string;
  suitableCareers: string[];
  suggestedSkills: string[];
  image?: string;
}

export interface HollandTestResult {
  scores: {
    R: number;
    I: number;
    A: number;
    S: number;
    E: number;
    C: number;
  };
  topCode: string;
  profile: HollandProfile | null;
  resultId: string;
}

export const hollandAPI = {
  getQuestions: async () => {
    const res = await http.get('/holland/questions');
    return res.data;
  },

  getProfiles: async () => {
    const res = await http.get('/holland/profiles');
    return res.data;
  },

  submitTest: async (answers: Record<string, number>) => {
    const res = await http.post('/holland/submit', { answers });
    return res.data as HollandTestResult;
  },

  getMyResult: async () => {
    const res = await http.get('/holland/my-result');
    return res.data;
  },
};
