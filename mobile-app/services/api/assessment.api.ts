import { API_CONFIG } from '@/constants/api-config';
import { apiClient } from './client';
import type {
  Assessment,
  AssessmentListResponse,
  AssessmentStatsResponse,
  CreateAssessmentDTO,
} from '@/types/assessment';

export const assessmentApi = {
  async getAssessments(page: number = 1, limit: number = 20): Promise<AssessmentListResponse> {
    return apiClient.get<AssessmentListResponse>(
      `${API_CONFIG.ENDPOINTS.ASSESSMENTS}?page=${page}&limit=${limit}`
    );
  },

  async getAssessmentById(id: string): Promise<{ success: boolean; assessment: Assessment }> {
    return apiClient.get(API_CONFIG.ENDPOINTS.ASSESSMENT_BY_ID(id));
  },

  async getStats(): Promise<AssessmentStatsResponse> {
    return apiClient.get<AssessmentStatsResponse>(API_CONFIG.ENDPOINTS.ASSESSMENT_STATS);
  },

  async createAssessment(
    data: CreateAssessmentDTO
  ): Promise<{ success: boolean; message: string; assessment: Assessment }> {
    return apiClient.post('/api/assessments', data);
  },

  async updateAssessment(
    id: string,
    updates: Partial<CreateAssessmentDTO>
  ): Promise<{ success: boolean; message: string; assessment: Assessment }> {
    return apiClient.patch(API_CONFIG.ENDPOINTS.ASSESSMENT_BY_ID(id), updates);
  },

  async deleteAssessment(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(API_CONFIG.ENDPOINTS.ASSESSMENT_BY_ID(id));
  },
};
