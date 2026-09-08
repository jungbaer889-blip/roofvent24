import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const load = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));

export const guides = [...load('guides-a.json'), ...load('guides-b.json')];
