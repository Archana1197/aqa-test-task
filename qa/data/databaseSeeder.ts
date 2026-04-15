import type { ResultSetHeader } from 'mysql2';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { getDatabaseConfig } from '../config/database';

export interface SeedUserInput {
  username: string;
  email: string;
  password: string;
}

export interface SeededUser extends SeedUserInput {
  id: number;
}

export class DatabaseSeeder {
  private static pool: mysql.Pool | null = null;

  private static getPool(): mysql.Pool {
    if (!this.pool) {
      const config = getDatabaseConfig();
      this.pool = mysql.createPool({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
        connectionLimit: config.connectionLimit,
      });
    }
    return this.pool;
  }

  static async createTestUser(userData: SeedUserInput): Promise<SeededUser> {
    const config = getDatabaseConfig();
    const passwordHash = await bcrypt.hash(userData.password, 10);
    const pool = this.getPool();

    const [result] = await pool.execute<ResultSetHeader>(config.seedUserSql, [
      userData.username,
      userData.email,
      passwordHash,
    ]);

    return {
      id: Number(result.insertId ?? 0),
      ...userData,
    };
  }

  static async cleanupUserByEmail(email: string): Promise<void> {
    const config = getDatabaseConfig();
    const pool = this.getPool();
    await pool.execute(config.cleanupUserSql, [email]);
  }

  static async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}
