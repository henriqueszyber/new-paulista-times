import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { createDatabaseClient } from './database.js';

const schema = `CREATE TABLE IF NOT EXISTS places (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL,
  category TEXT NOT NULL, address TEXT NOT NULL, latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL, author_id TEXT NOT NULL, created_at TEXT NOT NULL
)`;
const mapped = row => ({ id: row.id, name: row.name, description: row.description,
  category: row.category, address: row.address, latitude: row.latitude, longitude: row.longitude,
  googlePlaceId: row.google_place_id || '', createdAt: row.created_at });

// One repository per app keeps lifecycle and test databases isolated.
export async function createPlacesRepository() {
  let db;
  let sql;
  if (process.env.DATABASE_URL && !process.env.NEWS_DB_PATH) {
    sql = createDatabaseClient();
    await sql.query(schema);
    await sql`ALTER TABLE places ADD COLUMN IF NOT EXISTS google_place_id TEXT NOT NULL DEFAULT ''`;
  } else {
    const path = process.env.NEWS_DB_PATH || fileURLToPath(new URL('../../data/news.sqlite', import.meta.url));
    const filename = path === ':memory:' ? path : resolve(path);
    if (filename !== ':memory:') mkdirSync(dirname(filename), { recursive: true });
    db = new DatabaseSync(filename);
    db.exec(schema);
    if (!db.prepare('PRAGMA table_info(places)').all().some(column => column.name === 'google_place_id')) {
      db.exec("ALTER TABLE places ADD COLUMN google_place_id TEXT NOT NULL DEFAULT ''");
    }
  }
  return {
    close() { db?.close(); },
    async list() {
      const rows = sql ? await sql`SELECT * FROM places ORDER BY created_at DESC, id` : db.prepare('SELECT * FROM places ORDER BY created_at DESC, id').all();
      return rows.map(mapped);
    },
    async update(id, values) {
      const { name, description, category, address, latitude, longitude, googlePlaceId = '' } = values;
      let row;
      if (sql) {
        [row] = await sql`UPDATE places SET name = ${name}, description = ${description}, category = ${category},
          address = ${address}, latitude = ${latitude}, longitude = ${longitude}, google_place_id = ${googlePlaceId}
          WHERE id = ${id} RETURNING *`;
      } else {
        row = db.prepare('UPDATE places SET name = ?, description = ?, category = ?, address = ?, latitude = ?, longitude = ?, google_place_id = ? WHERE id = ? RETURNING *')
          .get(name, description, category, address, latitude, longitude, googlePlaceId, id);
      }
      return row ? mapped(row) : null;
    },
    async create(values, authorId) {
      const { name, description, category, address, latitude, longitude, googlePlaceId = '' } = values;
      const id = randomUUID();
      const createdAt = new Date().toISOString();
      if (sql) {
        await sql`INSERT INTO places (id, name, description, category, address, latitude, longitude, author_id, created_at, google_place_id)
          VALUES (${id}, ${name}, ${description}, ${category}, ${address}, ${latitude}, ${longitude}, ${authorId}, ${createdAt}, ${googlePlaceId})`;
      } else {
        db.prepare('INSERT INTO places (id, name, description, category, address, latitude, longitude, author_id, created_at, google_place_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
          .run(id, name, description, category, address, latitude, longitude, authorId, createdAt, googlePlaceId);
      }
      return { id, ...values, createdAt };
    },
  };
}
