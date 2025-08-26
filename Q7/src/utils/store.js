import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');

async function ensureFiles() {
  await fs.mkdir(dataDir, { recursive: true });
  const defaults = [
    { file: 'categories.json', value: [] },
    { file: 'products.json', value: [] }
  ];
  for (const d of defaults) {
    const p = path.join(dataDir, d.file);
    try {
      await fs.access(p);
    } catch {
      await fs.writeFile(p, JSON.stringify(d.value, null, 2));
    }
  }
}

export async function readJson(name) {
  await ensureFiles();
  const p = path.join(dataDir, `${name}.json`);
  const raw = await fs.readFile(p, 'utf8');
  return JSON.parse(raw || '[]');
}

export async function writeJson(name, data) {
  await ensureFiles();
  const p = path.join(dataDir, `${name}.json`);
  await fs.writeFile(p, JSON.stringify(data, null, 2));
}

export function newId() {
  return Math.random().toString(36).slice(2, 10);
}
