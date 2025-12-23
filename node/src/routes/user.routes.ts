import { FastifyInstance } from 'fastify';
import { UserController } from '../controllers/user.controller.js';
import { UserService } from '../services/user.service.js';
import { UserRepository } from '../repositories/user.repository.js';
import { pool } from '../config/database.js';
import { getUserProfileSchema, updateUserProfileSchema } from '../schemas/user.schema.js';
import { authenticateJWT } from '../middleware/auth.middleware.js';

export async function userRoutes(fastify: FastifyInstance): Promise<void> {
  // Initialize dependencies
  const userRepo = new UserRepository(pool);
  const userService = new UserService(userRepo);
  const userController = new UserController(userService);

  // All routes require authentication
  fastify.addHook('onRequest', authenticateJWT);

  // GET /api/user/profile
  fastify.get(
    '/profile',
    { schema: getUserProfileSchema },
    async (request, reply) => {
      return userController.getProfile(request, reply);
    }
  );

  // PATCH /api/user/profile
  fastify.patch(
    '/profile',
    { schema: updateUserProfileSchema },
    async (request, reply) => {
      return userController.updateProfile(request, reply);
    }
  );
}
