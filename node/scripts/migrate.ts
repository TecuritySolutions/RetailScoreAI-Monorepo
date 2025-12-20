import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set in .env file');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
});

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');

  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful\n');

    // Migration 1: Create users table
    console.log('📝 Running migration: 001_create_users_table.sql');
    const migration1 = readFileSync(
      join(process.cwd(), 'src/database/migrations/001_create_users_table.sql'),
      'utf-8'
    );
    await pool.query(migration1);
    console.log('✅ Migration 001 completed\n');

    // Migration 2: Create otp_tokens table
    console.log('📝 Running migration: 002_create_otp_tokens_table.sql');
    const migration2 = readFileSync(
      join(process.cwd(), 'src/database/migrations/002_create_otp_tokens_table.sql'),
      'utf-8'
    );
    await pool.query(migration2);
    console.log('✅ Migration 002 completed\n');

    console.log('🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
