export enum AssessmentStatus {
  DRAFT = 'DRAFT',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export interface Assessment {
  id: string;
  user_id: string;
  store_name: string;
  store_location: string | null;
  store_type: string | null;
  assessment_date: string;
  overall_score: number | null;
  cleanliness_score: number | null;
  customer_service_score: number | null;
  product_quality_score: number | null;
  pricing_score: number | null;
  notes: string | null;
  photos: string[] | null;
  tags: string[] | null;
  status: AssessmentStatus;
  created_at: string;
  updated_at: string;
}

export interface AssessmentListResponse {
  success: boolean;
  data: {
    assessments: Assessment[];
    pagination: {
      page: number;
      limit: number;
      total_count: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  };
}

export interface AssessmentStatsResponse {
  success: boolean;
  stats: {
    total_assessments: number;
    average_score: number | null;
    assessments_this_month: number;
    assessments_this_year: number;
  };
}

export interface CreateAssessmentDTO {
  store_name: string;
  store_location?: string;
  store_type?: string;
  assessment_date?: string;
  overall_score?: number;
  cleanliness_score?: number;
  customer_service_score?: number;
  product_quality_score?: number;
  pricing_score?: number;
  notes?: string;
  photos?: string[];
  tags?: string[];
  status?: AssessmentStatus;
}
