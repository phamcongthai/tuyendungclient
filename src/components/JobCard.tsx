import React from "react";
import type { JobData } from "../types/models";
import { Link } from "react-router-dom";

type JobCardProps = {
  job: JobData;
};

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const formatSalary = () => {
    if (job.salaryNegotiable) return "Thỏa thuận";
    if (job.salaryMin && job.salaryMax) {
      return `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} ${job.salaryType || "VNĐ"}`;
    }
    if (job.salaryMin) {
      return `Từ ${job.salaryMin.toLocaleString()} ${job.salaryType || "VNĐ"}`;
    }
    if (job.salaryMax) {
      return `Tới ${job.salaryMax.toLocaleString()} ${job.salaryType || "VNĐ"}`;
    }
    return "Không rõ";
  };
  const formatDeadline = (job: JobData) => {
    const raw: any = job.deadline
    if (!raw) return ''
    const dt = new Date(raw)
    return isNaN(dt.getTime()) ? String(raw) : dt.toLocaleDateString('vi-VN')
  }

  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
      <Link to={`/jobs/${job.slug}`}>
        <div className="flex items-center gap-3">
          <img
            src={(() => {
              const companyObj = (typeof job.companyId === 'object' && job.companyId) ? (job.companyId as any) : null
              const logo = job.company?.logo || job.companyLogo || companyObj?.logo
              return logo || job.images?.[0] || "/default-logo.png"
            })()}
            alt={job.title}
            className="w-14 h-14 object-contain rounded border"
          />
          <div>
            <h2 className="font-semibold text-base leading-snug">{job.title}</h2>
            {/* Tên công ty để trống */}
            <p className="text-sm text-gray-400 h-4"></p>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <span className="px-3 py-1 bg-gray-100 rounded text-sm text-gray-700">
            {formatSalary()}
          </span>
          <span className="px-3 py-1 bg-gray-100 rounded text-sm text-gray-700">
            {job.location || "Không rõ"}
          </span>
        </div>
        
        <div className="flex gap-2 mt-2">
          {job.experienceYears && (
            <span className="px-3 py-1 bg-blue-50 rounded text-sm text-blue-700">
              {job.experienceYears}
            </span>
          )}
          {job.workingHours && (
            <span className="px-3 py-1 bg-green-50 rounded text-sm text-green-700">
              {job.workingHours}
            </span>
          )}
          {job.education && (
            <span className="px-3 py-1 bg-purple-50 rounded text-sm text-purple-700">
              {job.education}
            </span>
          )}
          {job.deadline && (
            <span className="px-3 py-1 bg-orange-50 rounded text-sm text-orange-700">
              Hạn: {formatDeadline(job)}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
};

export default JobCard;
