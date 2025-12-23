import { Pool } from 'pg';
import { User, CreateUserDTO, UpdateUserDTO, UpdateUserProfileDTO, UserProfile } from '../models/user.model.js';
import { DatabaseError, NotFoundError } from '../utils/errors.js';

export class UserRepository {
  constructor(private db: Pool) {}

  async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await this.db.query<User>(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new DatabaseError(`Failed to find user by email: ${error}`);
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const result = await this.db.query<User>(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new DatabaseError(`Failed to find user by ID: ${error}`);
    }
  }

  async create(data: CreateUserDTO): Promise<User> {
    try {
      const result = await this.db.query<User>(
        `INSERT INTO users (email)
         VALUES ($1)
         RETURNING *`,
        [data.email]
      );

      if (!result.rows[0]) {
        throw new DatabaseError('Failed to create user');
      }

      return result.rows[0];
    } catch (error) {
      if ((error as any).code === '23505') {
        // Unique constraint violation
        throw new DatabaseError('User with this email already exists');
      }
      throw new DatabaseError(`Failed to create user: ${error}`);
    }
  }

  async update(id: string, data: UpdateUserDTO): Promise<User> {
    try {
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (data.is_verified !== undefined) {
        updates.push(`is_verified = $${paramCount++}`);
        values.push(data.is_verified);
      }

      if (data.last_login_at !== undefined) {
        updates.push(`last_login_at = $${paramCount++}`);
        values.push(data.last_login_at);
      }

      if (updates.length === 0) {
        // No updates to perform, just return the existing user
        const user = await this.findById(id);
        if (!user) {
          throw new NotFoundError('User not found');
        }
        return user;
      }

      values.push(id);

      const result = await this.db.query<User>(
        `UPDATE users
         SET ${updates.join(', ')}
         WHERE id = $${paramCount}
         RETURNING *`,
        values
      );

      if (!result.rows[0]) {
        throw new NotFoundError('User not found');
      }

      return result.rows[0];
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(`Failed to update user: ${error}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const result = await this.db.query(
        'DELETE FROM users WHERE id = $1',
        [id]
      );

      if (result.rowCount === 0) {
        throw new NotFoundError('User not found');
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(`Failed to delete user: ${error}`);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: UpdateUserProfileDTO): Promise<User> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      // Build dynamic UPDATE query based on provided fields
      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
          fields.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      }

      if (fields.length === 0) {
        // No fields to update, return current user
        const user = await this.findById(userId);
        if (!user) {
          throw new NotFoundError('User not found');
        }
        return user;
      }

      const query = `
        UPDATE users
        SET ${fields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;
      values.push(userId);

      const result = await this.db.query<User>(query, values);

      if (result.rows.length === 0) {
        throw new NotFoundError('User not found');
      }

      if (!result.rows[0]) {
        throw new DatabaseError('Failed to update user profile: No result returned');
      }

      return result.rows[0];
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Failed to update user profile: ${error}`);
    }
  }

  /**
   * Get user profile (excluding sensitive fields)
   */
  async getProfile(userId: string): Promise<UserProfile> {
    try {
      const query = `
        SELECT
          id, email, full_name, phone_number, photo_url,
          company_name, city, state, country, subscription_tier,
          total_assessments_count, created_at, last_login_at
        FROM users
        WHERE id = $1
      `;

      const result = await this.db.query<UserProfile>(query, [userId]);

      if (result.rows.length === 0) {
        throw new NotFoundError('User not found');
      }

      if (!result.rows[0]) {
        throw new DatabaseError('Failed to get user profile: No result returned');
      }

      return result.rows[0];
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Failed to get user profile: ${error}`);
    }
  }
}
