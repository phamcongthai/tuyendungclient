export type Company = {
  id: string
  name: string
  slug?: string
  logo?: string
  logoText?: string
  hot?: boolean
  location?: string
  size?: string | number
}

export type JobData = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  quantity?: number;
  salaryMin?: number;
  salaryMax?: number;
  salaryType?: string;
  salaryNegotiable?: boolean;
  career?: string;
  categoryId?: string; 
  level?: string;
  jobType?: string;
  location?: string;
  address?: string;
  // Lifecycle
  status?: 'draft' | 'active' | 'expired';
  deadline?: string; 
  skills: string[];
  tags: string[];
  images?: string[];
  recruiterId?: string;
  // companyId can be either a string (ObjectId) or a populated Company object
  companyId?: string | {
    _id: string;
    name: string;
    slug: string;
    logo?: string;
  };
  companySlug?: string;
  companyName?: string;
  companyLogo?: string;
  companySize?: string | number;
  companyLocation?: string;
  company?: {
    id?: string;
    slug?: string;
    name?: string;
    logo?: string;
    size?: string | number;
    location?: string;
  };
  experienceYears?: string; // Năm kinh nghiệm
  workingHours?: string; // Giờ làm việc
  education?: string; // Học vấn
  createdAt: string;
  updatedAt: string;
}

export type JobCategory = {
  id: string
  name: string
  count: number
}