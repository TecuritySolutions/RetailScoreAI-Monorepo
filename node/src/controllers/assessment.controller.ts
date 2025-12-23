import { FastifyRequest, FastifyReply } from 'fastify';
import { AssessmentService } from '../services/assessment.service.js';
import {
  createAssessmentBodySchema,
  updateAssessmentBodySchema,
  listAssessmentsQuerySchema,
} from '../schemas/assessment.schema.js';
import { AssessmentStatus } from '../models/assessment.model.js';

export class AssessmentController {
  constructor(private assessmentService: AssessmentService) {}

  /**
   * Create new assessment
   * POST /api/assessments
   */
  async createAssessment(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.user.userId;
    const body = createAssessmentBodySchema.parse(request.body);

    const dto: any = {
      store_name: body.store_name,
    };

    if (body.store_location !== undefined) dto.store_location = body.store_location;
    if (body.store_type !== undefined) dto.store_type = body.store_type;
    if (body.assessment_date !== undefined) dto.assessment_date = new Date(body.assessment_date);
    if (body.overall_score !== undefined) dto.overall_score = body.overall_score;
    if (body.cleanliness_score !== undefined) dto.cleanliness_score = body.cleanliness_score;
    if (body.customer_service_score !== undefined) dto.customer_service_score = body.customer_service_score;
    if (body.product_quality_score !== undefined) dto.product_quality_score = body.product_quality_score;
    if (body.pricing_score !== undefined) dto.pricing_score = body.pricing_score;
    if (body.notes !== undefined) dto.notes = body.notes;
    if (body.photos !== undefined) dto.photos = body.photos;
    if (body.tags !== undefined) dto.tags = body.tags;
    if (body.status !== undefined) dto.status = body.status as AssessmentStatus;

    const assessment = await this.assessmentService.createAssessment(userId, dto);

    return reply.code(201).send({
      success: true,
      message: 'Assessment created successfully',
      assessment,
    });
  }

  /**
   * Get single assessment
   * GET /api/assessments/:id
   */
  async getAssessment(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.user.userId;
    const { id } = request.params as { id: string };

    const assessment = await this.assessmentService.getAssessment(id, userId);

    return reply.code(200).send({
      success: true,
      assessment,
    });
  }

  /**
   * List user's assessments with pagination
   * GET /api/user/assessments
   */
  async listAssessments(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.user.userId;
    const query = listAssessmentsQuerySchema.parse(request.query);

    const options: any = {
      page: query.page,
      limit: query.limit,
      sortBy: query.sort_by,
      sortOrder: query.sort_order,
    };

    if (query.status !== undefined) options.status = query.status;
    if (query.from_date !== undefined) options.fromDate = new Date(query.from_date);
    if (query.to_date !== undefined) options.toDate = new Date(query.to_date);

    const result = await this.assessmentService.listAssessments(userId, options);

    return reply.code(200).send({
      success: true,
      data: result,
    });
  }

  /**
   * Update assessment
   * PATCH /api/assessments/:id
   */
  async updateAssessment(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.user.userId;
    const { id } = request.params as { id: string };
    const body = updateAssessmentBodySchema.parse(request.body);

    const dto: any = {};

    if (body.store_name !== undefined) dto.store_name = body.store_name;
    if (body.store_location !== undefined) dto.store_location = body.store_location;
    if (body.store_type !== undefined) dto.store_type = body.store_type;
    if (body.assessment_date !== undefined) dto.assessment_date = new Date(body.assessment_date);
    if (body.overall_score !== undefined) dto.overall_score = body.overall_score;
    if (body.cleanliness_score !== undefined) dto.cleanliness_score = body.cleanliness_score;
    if (body.customer_service_score !== undefined) dto.customer_service_score = body.customer_service_score;
    if (body.product_quality_score !== undefined) dto.product_quality_score = body.product_quality_score;
    if (body.pricing_score !== undefined) dto.pricing_score = body.pricing_score;
    if (body.notes !== undefined) dto.notes = body.notes;
    if (body.photos !== undefined) dto.photos = body.photos;
    if (body.tags !== undefined) dto.tags = body.tags;
    if (body.status !== undefined) dto.status = body.status as AssessmentStatus;

    const assessment = await this.assessmentService.updateAssessment(id, userId, dto);

    return reply.code(200).send({
      success: true,
      message: 'Assessment updated successfully',
      assessment,
    });
  }

  /**
   * Delete assessment
   * DELETE /api/assessments/:id
   */
  async deleteAssessment(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.user.userId;
    const { id } = request.params as { id: string };

    await this.assessmentService.deleteAssessment(id, userId);

    return reply.code(200).send({
      success: true,
      message: 'Assessment deleted successfully',
    });
  }

  /**
   * Get assessment statistics
   * GET /api/user/assessments/stats
   */
  async getStats(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.user.userId;

    const stats = await this.assessmentService.getStats(userId);

    return reply.code(200).send({
      success: true,
      stats,
    });
  }
}
