// index.js — safety shim for platforms that try `node index.js`
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// load env from property.env at repo root (if present)
dotenv.config({ path: path.join(__dirname, 'property.env') });

// hand off to real server
import('./src/index.js');
