import { FastifyInstance } from 'fastify';
import { AssessmentController } from '../controllers/assessment.controller.js';
import { AssessmentService } from '../services/assessment.service.js';
import { AssessmentRepository } from '../repositories/assessment.repository.js';
import { pool } from '../config/database.js';
import { authenticateJWT } from '../middleware/auth.middleware.js';
import {
  createAssessmentSchema,
  getAssessmentSchema,
  updateAssessmentSchema,
  deleteAssessmentSchema,
  listAssessmentsSchema,
  getAssessmentStatsSchema,
} from '../schemas/assessment.schema.js';

export async function assessmentRoutes(fastify: FastifyInstance): Promise<void> {
  // Initialize dependencies
  const assessmentRepo = new AssessmentRepository(pool);
  const assessmentService = new AssessmentService(assessmentRepo);
  const assessmentController = new AssessmentController(assessmentService);

  // All routes require authentication
  fastify.addHook('onRequest', authenticateJWT);

  // POST /api/assessments
  fastify.post(
    '/',
    { schema: createAssessmentSchema },
    async (request, reply) => {
      return assessmentController.createAssessment(request, reply);
    }
  );

  // GET /api/assessments/:id
  fastify.get(
    '/:id',
    { schema: getAssessmentSchema },
    async (request, reply) => {
      return assessmentController.getAssessment(request, reply);
    }
  );

  // PATCH /api/assessments/:id
  fastify.patch(
    '/:id',
    { schema: updateAssessmentSchema },
    async (request, reply) => {
      return assessmentController.updateAssessment(request, reply);
    }
  );

  // DELETE /api/assessments/:id
  fastify.delete(
    '/:id',
    { schema: deleteAssessmentSchema },
    async (request, reply) => {
      return assessmentController.deleteAssessment(request, reply);
    }
  );
}

// User-specific assessment routes
export async function userAssessmentRoutes(fastify: FastifyInstance): Promise<void> {
  const assessmentRepo = new AssessmentRepository(pool);
  const assessmentService = new AssessmentService(assessmentRepo);
  const assessmentController = new AssessmentController(assessmentService);

  fastify.addHook('onRequest', authenticateJWT);

  // GET /api/user/assessments
  fastify.get(
    '/assessments',
    { schema: listAssessmentsSchema },
    async (request, reply) => {
      return assessmentController.listAssessments(request, reply);
    }
  );

  // GET /api/user/assessments/stats
  fastify.get(
    '/assessments/stats',
    { schema: getAssessmentStatsSchema },
    async (request, reply) => {
      return assessmentController.getStats(request, reply);
    }
  );
}
