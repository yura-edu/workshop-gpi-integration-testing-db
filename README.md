# Pruebas de Integración con BD Real

> **Tipo:** TESTING · **Duración estimada:** 240 min · **Nivel:** Avanzado

## Objetivo

Configurar un entorno de integración con PostgreSQL efímero vía Docker Compose, escribir ≥ 8 tests que validen operaciones CRUD, transacciones, rollbacks y violaciones de constraint, e integrarlo en el pipeline de CI.

## Contexto

Las pruebas unitarias con mocks de BD son rápidas pero engañosas: no detectan problemas reales de constraints FK, transacciones o comportamiento de PostgreSQL. El mantra de este taller: **"no mockes lo que no posees"**.

## Pre-requisitos

- Docker y Docker Compose instalados
- Node.js 20+ y npm
- `psql` disponible (para ejecutar migraciones localmente)

## Instrucciones

### 1. Instala dependencias

```bash
cd starter-code
npm install
```

### 2. Crea el archivo `compose.test.yml`

Copia el ejemplo y completa los campos en blanco:

```bash
cp compose.test.yml.example compose.test.yml
```

Edita `compose.test.yml` y reemplaza los `____` con:
- Puerto del host: `5433` (evita conflicto con PostgreSQL local en 5432)
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`: elige los valores que quieras

### 3. Crea el archivo `.env.test`

```bash
cp .env.test.example .env.test
```

Ajusta los valores para que coincidan con lo que pusiste en `compose.test.yml`.

### 4. Levanta la BD de pruebas

```bash
docker compose -f compose.test.yml up -d
```

### 5. Ejecuta la migración inicial

```bash
export $(cat .env.test | xargs)
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
  -f src/migrations/001_init.sql
```

### 6. Explora el repositorio provisto

Abre `src/repositories/product.repository.ts`. Verás la implementación completa de:

| Método | Descripción |
|---|---|
| `findAll()` | Retorna todos los productos con su categoría |
| `findById(id)` | Retorna producto por id o `null` |
| `create(data)` | Crea un producto; falla si `category_id` no existe |
| `update(id, data)` | Actualiza campos del producto |
| `delete(id)` | Elimina el producto |
| `findByCategory(categoryId)` | Retorna productos de una categoría |
| `updateStock(id, delta)` | Incrementa/decrementa stock; falla si resulta negativo |

**No modifiques el repositorio.** Tu tarea es escribir los tests.

### 7. Escribe los tests de integración

Crea tu archivo de tests en `tests/integration/product.repository.test.ts`.

Debes cubrir **al menos estos 8 escenarios** (uno por escenario mínimo):

1. Crear producto con categoría válida → éxito
2. Crear producto con `category_id` inexistente → falla con error FK
3. Actualizar stock positivamente → éxito y stock actualizado
4. Actualizar stock a negativo → error
5. Buscar producto por id existente → retorna el producto correcto
6. Buscar producto por id inexistente → retorna `null`
7. Eliminar producto existente → retorna `true`
8. Rollback: fallar una transacción a mitad → los datos no cambian

Puedes agregar más. Los tests en `tests/unit/` no cuentan para el umbral.

### 8. Ejecuta los tests con cobertura

```bash
npm run test:coverage
```

Apunta a ≥ 75% de cobertura de líneas/ramas en la capa de repositorio.

### 9. Actualiza el CI para incluir la BD

Edita `.github/workflows/ci.yml` para que levante el contenedor antes de correr los tests y lo baje después.

### 10. Abre el Pull Request

Abre un PR hacia `main` que incluya:
- `compose.test.yml` completado
- `.env.test` (sin contraseñas reales si usas producción — para este taller está bien)
- Tu archivo de tests en `tests/integration/`
- El CI actualizado

## Criterios de evaluación

| Métrica | Peso | Umbral |
|---|---|---|
| Cobertura de tests | 30% | ≥ 75% de líneas/ramas del repositorio |
| Tasa de tests pasando | 25% | 100% de los tests pasan |
| Cantidad de integration tests | 20% | ≥ 8 tests en `tests/integration/` |
| Pipeline CI | 15% | CI ejecuta tests con BD real y pasa |
| Schema compose válido | 10% | `compose.test.yml` es YAML válido con imagen PostgreSQL oficial |

## Recursos

- [node-postgres (pg)](https://node-postgres.com/)
- [Jest — Testing Async Code](https://jestjs.io/docs/asynchronous)
- [PostgreSQL — Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- [Docker Compose — Healthchecks](https://docs.docker.com/compose/compose-file/05-services/#healthcheck)
