import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { initialNews } from '../data.js';
import { plainTextDocument } from '../content.js';
import { createDatabaseClient } from './database.js';

const localPath = fileURLToPath(new URL('../../data/news.sqlite', import.meta.url));
let store;

function mapRow(row) {
  if (!row) return null;
  return {
    id: String(row.id), title: row.title, summary: row.summary,
    category: row.category, content: typeof row.content_json === 'string' ? JSON.parse(row.content_json) : row.content_json,
    status: row.status, authorId: row.author_id, author: row.author,
    createdAt: row.created_at, updatedAt: row.updated_at,
    imageUrl: row.image_url || '', imagePublicId: row.image_public_id || '',
    imageAlt: row.image_alt || '', imageCredit: row.image_credit || '',
  };
}

function seedValues(item) {
  return [item.id, item.title, item.summary, item.category,
    JSON.stringify(plainTextDocument(item.content)), 'published', item.authorId,
    item.author, item.createdAt, item.createdAt];
}

function createSqliteStore(path) {
  const filename = path === ':memory:' ? path : resolve(path);
  if (filename !== ':memory:') mkdirSync(dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec(`CREATE TABLE IF NOT EXISTS news (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, summary TEXT NOT NULL,
    category TEXT NOT NULL, content_json TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
    author_id TEXT NOT NULL, author TEXT NOT NULL,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL
  )`);
  // Acrescenta as colunas sem apagar notícias que já existem.
  const columns = db.prepare('PRAGMA table_info(news)').all();
  for (const name of ['image_url', 'image_public_id', 'image_alt', 'image_credit']) {
    if (!columns.some(column => column.name === name)) db.exec(`ALTER TABLE news ADD COLUMN ${name} TEXT NOT NULL DEFAULT ''`);
  }
  const seed = db.prepare(`INSERT OR IGNORE INTO news
    (id, title, summary, category, content_json, status, author_id, author, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  for (const item of initialNews) seed.run(...seedValues(item));

  return {
    mode: 'sqlite',
    close() { db.close(); },
    async findAll(includeDrafts = false) {
      const query = includeDrafts
        ? 'SELECT * FROM news ORDER BY updated_at DESC'
        : "SELECT * FROM news WHERE status = 'published' ORDER BY created_at DESC";
      return db.prepare(query).all().map(mapRow);
    },
    async findById(id) { return mapRow(db.prepare('SELECT * FROM news WHERE id = ?').get(id)); },
    async create(values) {
      const id = randomUUID();
      const now = new Date().toISOString();
      db.prepare(`INSERT INTO news
        (id, title, summary, category, content_json, status, author_id, author, created_at, updated_at, image_url, image_public_id, image_alt, image_credit)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` )
        .run(id, values.title, values.summary, values.category, JSON.stringify(values.content), values.status,
          values.authorId, values.author, now, now, values.imageUrl, values.imagePublicId, values.imageAlt, values.imageCredit);
      return this.findById(id);
    },
    async update(id, values) {
      const now = new Date().toISOString();
      db.prepare(`UPDATE news SET title = ?, summary = ?, category = ?, content_json = ?, status = ?, updated_at = ?, image_url = ?, image_public_id = ?, image_alt = ?, image_credit = ? WHERE id = ?`)
        .run(values.title, values.summary, values.category, JSON.stringify(values.content), values.status, now, values.imageUrl, values.imagePublicId, values.imageAlt, values.imageCredit, id);
      return this.findById(id);
    },
  };
}

async function createNeonStore() {
  const sql = createDatabaseClient();
  await sql`CREATE TABLE IF NOT EXISTS news (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, summary TEXT NOT NULL,
    category TEXT NOT NULL, content_json JSONB NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
    author_id TEXT NOT NULL, author TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL
  )`;
  // Migração aditiva e repetível no Neon.
  await sql`ALTER TABLE news
    ADD COLUMN IF NOT EXISTS image_url TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS image_public_id TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS image_alt TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS image_credit TEXT NOT NULL DEFAULT ''`;
  for (const item of initialNews) {
    const [id, title, summary, category, content, status, authorId, author, createdAt, updatedAt] = seedValues(item);
    await sql`INSERT INTO news (id, title, summary, category, content_json, status, author_id, author, created_at, updated_at)
      VALUES (${id}, ${title}, ${summary}, ${category}, ${content}::jsonb, ${status}, ${authorId}, ${author}, ${createdAt}, ${updatedAt})
      ON CONFLICT (id) DO NOTHING`;
  }
  const mapped = row => row && mapRow({ ...row, created_at: new Date(row.created_at).toISOString(), updated_at: new Date(row.updated_at).toISOString() });
  return {
    mode: 'neon',
    async findAll(includeDrafts = false) {
      const rows = includeDrafts
        ? await sql`SELECT * FROM news ORDER BY updated_at DESC`
        : await sql`SELECT * FROM news WHERE status = 'published' ORDER BY created_at DESC`;
      return rows.map(mapped);
    },
    async findById(id) { return mapped((await sql`SELECT * FROM news WHERE id = ${id}`)[0]); },
    async create(values) {
      const id = randomUUID();
      const content = JSON.stringify(values.content);
      const now = new Date().toISOString();
      await sql`INSERT INTO news (id, title, summary, category, content_json, status, author_id, author, created_at, updated_at, image_url, image_public_id, image_alt, image_credit)
        VALUES (${id}, ${values.title}, ${values.summary}, ${values.category}, ${content}::jsonb, ${values.status}, ${values.authorId}, ${values.author}, ${now}, ${now}, ${values.imageUrl}, ${values.imagePublicId}, ${values.imageAlt}, ${values.imageCredit})`;
      return this.findById(id);
    },
    async update(id, values) {
      const content = JSON.stringify(values.content);
      const now = new Date().toISOString();
      await sql`UPDATE news SET title = ${values.title}, summary = ${values.summary}, category = ${values.category},
        content_json = ${content}::jsonb, status = ${values.status}, updated_at = ${now},
        image_url = ${values.imageUrl}, image_public_id = ${values.imagePublicId}, image_alt = ${values.imageAlt}, image_credit = ${values.imageCredit} WHERE id = ${id}`;
      return this.findById(id);
    },
  };
}

async function getStore() {
  if (!store) {
    store = process.env.DATABASE_URL && !process.env.NEWS_DB_PATH
      ? createNeonStore()
      : createSqliteStore(process.env.NEWS_DB_PATH || localPath);
  }
  return await store;
}

const newsRepository = {
  async close() {
    if (store) {
      const current = await store;
      if (current.close) current.close();
      store = undefined;
    }
  },
  async init() { return (await getStore()).mode; },
  async findAll(includeDrafts) { return (await getStore()).findAll(includeDrafts); },
  async findById(id) { return (await getStore()).findById(id); },
  async create(values) { return (await getStore()).create(values); },
  async update(id, values) { return (await getStore()).update(id, values); },
};

export default newsRepository;
