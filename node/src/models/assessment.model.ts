// Assessment status enum
export enum AssessmentStatus {
  DRAFT = 'DRAFT',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

// Main assessment interface
export interface Assessment {
  id: string;
  user_id: string;

  // Store information
  store_name: string;
  store_location: string | null;
  store_type: string | null;

  // Assessment details
  assessment_date: Date;
  overall_score: number | null;

  // Detailed scores
  cleanliness_score: number | null;
  customer_service_score: number | null;
  product_quality_score: number | null;
  pricing_score: number | null;

  // Additional data
  notes: string | null;
  photos: string[] | null; // Array of URLs
  tags: string[] | null;

  // Metadata
  status: AssessmentStatus;
  created_at: Date;
  updated_at: Date;
}

// DTO for creating assessment
export interface CreateAssessmentDTO {
  store_name: string;
  store_location?: string;
  store_type?: string;
  assessment_date?: Date;
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

// DTO for updating assessment
export interface UpdateAssessmentDTO {
  store_name?: string;
  store_location?: string;
  store_type?: string;
  assessment_date?: Date;
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

// Paginated assessment list response
export interface PaginatedAssessments {
  assessments: Assessment[];
  pagination: {
    page: number;
    limit: number;
    total_count: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// Assessment statistics
export interface AssessmentStats {
  total_assessments: number;
  average_score: number | null;
  assessments_this_month: number;
  assessments_this_year: number;
}
