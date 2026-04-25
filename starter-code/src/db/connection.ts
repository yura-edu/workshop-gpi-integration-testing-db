import { Pool } from 'pg'

export function createPool(): Pool {
  return new Pool({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? '5433'),
    database: process.env.DB_NAME ?? 'testdb',
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
  })
}

export const pool = createPool()
