import { Pool } from 'pg';
import { User, CreateUserDTO, UpdateUserDTO } from '../models/user.model.js';
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
}
