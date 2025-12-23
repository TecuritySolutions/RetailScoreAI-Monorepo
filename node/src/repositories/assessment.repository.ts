import { Pool } from 'pg';
import {
  Assessment,
  CreateAssessmentDTO,
  UpdateAssessmentDTO,
  PaginatedAssessments,
  AssessmentStats,
} from '../models/assessment.model.js';
import { NotFoundError, DatabaseError } from '../utils/errors.js';

export class AssessmentRepository {
  constructor(private pool: Pool) {}

  /**
   * Create new assessment
   */
  async create(userId: string, data: CreateAssessmentDTO): Promise<Assessment> {
    const query = `
      INSERT INTO assessments (
        user_id, store_name, store_location, store_type,
        assessment_date, overall_score, cleanliness_score,
        customer_service_score, product_quality_score, pricing_score,
        notes, photos, tags, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const values = [
      userId,
      data.store_name,
      data.store_location || null,
      data.store_type || null,
      data.assessment_date || new Date(),
      data.overall_score || null,
      data.cleanliness_score || null,
      data.customer_service_score || null,
      data.product_quality_score || null,
      data.pricing_score || null,
      data.notes || null,
      data.photos ? JSON.stringify(data.photos) : null,
      data.tags || null,
      data.status || 'COMPLETED',
    ];

    try {
      const result = await this.pool.query<Assessment>(query, values);
      if (!result.rows[0]) {
        throw new DatabaseError('Failed to create assessment: No result returned');
      }
      return result.rows[0];
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Failed to create assessment: ${error}`);
    }
  }

  /**
   * Find assessment by ID (belonging to specific user)
   */
  async findById(id: string, userId: string): Promise<Assessment | null> {
    const query = `
      SELECT * FROM assessments
      WHERE id = $1 AND user_id = $2
    `;

    try {
      const result = await this.pool.query<Assessment>(query, [id, userId]);
      return result.rows[0] || null;
    } catch (error) {
      throw new DatabaseError(`Failed to find assessment: ${error}`);
    }
  }

  /**
   * Get paginated list of assessments for user
   */
  async findByUserId(
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
    const { page, limit, status, fromDate, toDate, sortBy, sortOrder } = options;
    const offset = (page - 1) * limit;

    // Build WHERE clause
    const conditions = ['user_id = $1'];
    const values: any[] = [userId];
    let paramIndex = 2;

    if (status) {
      conditions.push(`status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }

    if (fromDate) {
      conditions.push(`assessment_date >= $${paramIndex}`);
      values.push(fromDate);
      paramIndex++;
    }

    if (toDate) {
      conditions.push(`assessment_date <= $${paramIndex}`);
      values.push(toDate);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    try {
      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM assessments
        WHERE ${whereClause}
      `;
      const countResult = await this.pool.query(countQuery, values);
      const totalCount = parseInt(countResult.rows[0].total);

      // Get paginated data
      const dataQuery = `
        SELECT * FROM assessments
        WHERE ${whereClause}
        ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      values.push(limit, offset);

      const dataResult = await this.pool.query<Assessment>(dataQuery, values);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        assessments: dataResult.rows,
        pagination: {
          page,
          limit,
          total_count: totalCount,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_prev: page > 1,
        },
      };
    } catch (error) {
      throw new DatabaseError(`Failed to get assessments: ${error}`);
    }
  }

  /**
   * Update assessment
   */
  async update(id: string, userId: string, data: UpdateAssessmentDTO): Promise<Assessment> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        // Handle JSON fields
        if (key === 'photos') {
          fields.push(`${key} = $${paramIndex}::jsonb`);
          values.push(JSON.stringify(value));
        } else {
          fields.push(`${key} = $${paramIndex}`);
          values.push(value);
        }
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      const existing = await this.findById(id, userId);
      if (!existing) throw new NotFoundError('Assessment not found');
      return existing;
    }

    const query = `
      UPDATE assessments
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
      RETURNING *
    `;
    values.push(id, userId);

    try {
      const result = await this.pool.query<Assessment>(query, values);

      if (result.rows.length === 0) {
        throw new NotFoundError('Assessment not found');
      }

      if (!result.rows[0]) {
        throw new DatabaseError('Failed to update assessment: No result returned');
      }

      return result.rows[0];
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Failed to update assessment: ${error}`);
    }
  }

  /**
   * Delete assessment
   */
  async delete(id: string, userId: string): Promise<void> {
    const query = `
      DELETE FROM assessments
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `;

    try {
      const result = await this.pool.query(query, [id, userId]);

      if (result.rows.length === 0) {
        throw new NotFoundError('Assessment not found');
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(`Failed to delete assessment: ${error}`);
    }
  }

  /**
   * Get assessment statistics for user
   */
  async getStats(userId: string): Promise<AssessmentStats> {
    const query = `
      SELECT
        COUNT(*) as total_assessments,
        AVG(overall_score) as average_score,
        COUNT(CASE WHEN DATE_TRUNC('month', assessment_date) = DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as assessments_this_month,
        COUNT(CASE WHEN DATE_TRUNC('year', assessment_date) = DATE_TRUNC('year', CURRENT_DATE) THEN 1 END) as assessments_this_year
      FROM assessments
      WHERE user_id = $1 AND status = 'COMPLETED'
    `;

    try {
      const result = await this.pool.query(query, [userId]);
      const row = result.rows[0];

      return {
        total_assessments: parseInt(row.total_assessments),
        average_score: row.average_score ? parseFloat(row.average_score) : null,
        assessments_this_month: parseInt(row.assessments_this_month),
        assessments_this_year: parseInt(row.assessments_this_year),
      };
    } catch (error) {
      throw new DatabaseError(`Failed to get assessment stats: ${error}`);
    }
  }
}
