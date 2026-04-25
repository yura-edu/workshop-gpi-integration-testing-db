import { Pool } from 'pg'
import { pool } from '../db/connection'

export interface Product {
  id: number
  name: string
  price: string
  stock: number
  category_id: number | null
  created_at: Date
  category_name?: string
}

export interface CreateProductData {
  name: string
  price: number
  stock?: number
  category_id: number
}

export interface UpdateProductData {
  name?: string
  price?: number
  stock?: number
  category_id?: number
}

export class ProductRepository {
  constructor(private readonly db: Pool = pool) {}

  async findAll(): Promise<Product[]> {
    const { rows } = await this.db.query<Product>(`
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id
    `)
    return rows
  }

  async findById(id: number): Promise<Product | null> {
    const { rows } = await this.db.query<Product>(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [id],
    )
    return rows[0] ?? null
  }

  async create(data: CreateProductData): Promise<Product> {
    const { rows } = await this.db.query<Product>(
      `INSERT INTO products (name, price, stock, category_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.name, data.price, data.stock ?? 0, data.category_id],
    )
    return rows[0]
  }

  async update(id: number, data: UpdateProductData): Promise<Product | null> {
    const setClauses: string[] = []
    const values: unknown[] = []
    let paramIdx = 1

    if (data.name !== undefined) { setClauses.push(`name = $${paramIdx++}`); values.push(data.name) }
    if (data.price !== undefined) { setClauses.push(`price = $${paramIdx++}`); values.push(data.price) }
    if (data.stock !== undefined) { setClauses.push(`stock = $${paramIdx++}`); values.push(data.stock) }
    if (data.category_id !== undefined) { setClauses.push(`category_id = $${paramIdx++}`); values.push(data.category_id) }

    if (setClauses.length === 0) return this.findById(id)

    values.push(id)
    const { rows } = await this.db.query<Product>(
      `UPDATE products SET ${setClauses.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
      values,
    )
    return rows[0] ?? null
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db.query(
      'DELETE FROM products WHERE id = $1',
      [id],
    )
    return (result.rowCount ?? 0) > 0
  }

  async findByCategory(categoryId: number): Promise<Product[]> {
    const { rows } = await this.db.query<Product>(
      'SELECT * FROM products WHERE category_id = $1 ORDER BY id',
      [categoryId],
    )
    return rows
  }

  async updateStock(id: number, delta: number): Promise<Product> {
    const { rows, rowCount } = await this.db.query<Product>(
      `UPDATE products
       SET stock = stock + $1
       WHERE id = $2 AND stock + $1 >= 0
       RETURNING *`,
      [delta, id],
    )
    if ((rowCount ?? 0) === 0) {
      throw new Error('Stock update failed: would result in negative stock or product not found')
    }
    return rows[0]
  }
}
