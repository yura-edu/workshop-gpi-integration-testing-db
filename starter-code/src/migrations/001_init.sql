CREATE TABLE IF NOT EXISTS categories (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  price       DECIMAL(10, 2) NOT NULL,
  stock       INT NOT NULL DEFAULT 0,
  category_id INT REFERENCES categories(id) ON DELETE RESTRICT,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
