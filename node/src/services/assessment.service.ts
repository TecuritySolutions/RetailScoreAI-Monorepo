import { AssessmentRepository } from '../repositories/assessment.repository.js';
import {
  Assessment,
  CreateAssessmentDTO,
  UpdateAssessmentDTO,
  PaginatedAssessments,
  AssessmentStats,
} from '../models/assessment.model.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

export class AssessmentService {
  constructor(private assessmentRepo: AssessmentRepository) {}

  /**
   * Create new assessment
   */
  async createAssessment(userId: string, data: CreateAssessmentDTO): Promise<Assessment> {
    // Validate scores if provided
    this.validateScores(data);

    return await this.assessmentRepo.create(userId, data);
  }

  /**
   * Get single assessment
   */
  async getAssessment(id: string, userId: string): Promise<Assessment> {
    const assessment = await this.assessmentRepo.findById(id, userId);

    if (!assessment) {
      throw new NotFoundError('Assessment not found');
    }

    return assessment;
  }

  /**
   * Get paginated list of assessments
   */
  async listAssessments(
    userId: string,
    options: {
      page: number;
      limit: number;
      status?: string;
      fromDate?: Date;
      toDate?: Date;
      sortBy: string;
      sortOrder: string;
    }
  ): Promise<PaginatedAssessments> {
    return await this.assessmentRepo.findByUserId(userId, options);
  }

  /**
   * Update assessment
   */
  async updateAssessment(
    id: string,
    userId: string,
    data: UpdateAssessmentDTO
  ): Promise<Assessment> {
    // Validate scores if provided
    this.validateScores(data);

    return await this.assessmentRepo.update(id, userId, data);
  }

  /**
   * Delete assessment
   */
  async deleteAssessment(id: string, userId: string): Promise<void> {
    await this.assessmentRepo.delete(id, userId);
  }

  /**
   * Get assessment statistics
   */
  async getStats(userId: string): Promise<AssessmentStats> {
    return await this.assessmentRepo.getStats(userId);
  }

  /**
   * Validate score values
   */
  private validateScores(data: CreateAssessmentDTO | UpdateAssessmentDTO): void {
    const scores = [
      data.overall_score,
      data.cleanliness_score,
      data.customer_service_score,
      data.product_quality_score,
      data.pricing_score,
    ];

    for (const score of scores) {
      if (score !== undefined && score !== null) {
        if (score < 0 || score > 100) {
          throw new ValidationError('Scores must be between 0 and 100');
        }
      }
    }
  }
}
