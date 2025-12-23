import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '../services/user.service.js';
import { updateUserProfileBodySchema } from '../schemas/user.schema.js';

export class UserController {
  constructor(private userService: UserService) {}

  /**
   * Get current user profile
   * GET /api/user/profile
   */
  async getProfile(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.user.userId; // From JWT middleware

    const profile = await this.userService.getProfile(userId);

    return reply.code(200).send({
      success: true,
      user: profile,
    });
  }

  /**
   * Update user profile
   * PATCH /api/user/profile
   */
  async updateProfile(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.user.userId; // From JWT middleware
    const body = updateUserProfileBodySchema.parse(request.body);

    const dto: any = {};

    if (body.full_name !== undefined) dto.full_name = body.full_name;
    if (body.phone_number !== undefined) dto.phone_number = body.phone_number;
    if (body.photo_url !== undefined) dto.photo_url = body.photo_url;
    if (body.company_name !== undefined) dto.company_name = body.company_name;
    if (body.city !== undefined) dto.city = body.city;
    if (body.state !== undefined) dto.state = body.state;
    if (body.country !== undefined) dto.country = body.country;

    const updatedProfile = await this.userService.updateProfile(userId, dto);

    return reply.code(200).send({
      success: true,
      message: 'Profile updated successfully',
      user: updatedProfile,
    });
  }
}
