import { UserRepository } from '../repositories/user.repository.js';
import { UpdateUserProfileDTO, UserProfile } from '../models/user.model.js';
import { ValidationError } from '../utils/errors.js';

export class UserService {
  constructor(private userRepo: UserRepository) {}

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<UserProfile> {
    return await this.userRepo.getProfile(userId);
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: UpdateUserProfileDTO): Promise<UserProfile> {
    // Additional validation for phone numbers based on country
    if (data.phone_number && data.country) {
      if (data.country === 'India' && !/^\d{10}$/.test(data.phone_number)) {
        throw new ValidationError('Phone number must be 10 digits for India');
      }
    }

    await this.userRepo.updateProfile(userId, data);
    return await this.userRepo.getProfile(userId);
  }
}
