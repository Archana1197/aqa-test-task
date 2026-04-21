import { getDatabaseConfig } from '../config/database';
import { envString } from '../config/env';
import mysql from 'mysql2/promise';

export async function cleanupE2eUsers(): Promise<void> {
  const config = getDatabaseConfig();
  const prefix = envString('TEST_USER_PREFIX', 'e2e_user_');

  const pool = mysql.createPool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    connectionLimit: 1,
  });

  try {
    await pool.execute('DELETE FROM users WHERE username LIKE ?', [`${prefix}%`]);
  } finally {
    await pool.end();
  }
}
