import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER || 'app_user',       
  host: process.env.DB_HOST || 'db',             
  database: process.env.DB_NAME || 'biblioteca', 
  password: process.env.DB_PASSWORD || 'app_pass',
  port: 5432,
});

export const query = async (text: string, params?: any[]) => {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
    console.error('Error ejecutando query:', text);
    console.error(error);
    throw error;
  }
};