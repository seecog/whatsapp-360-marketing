// src/index.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { app } from './app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load property.env BEFORE importing anything that reads process.env
dotenv.config({ path: path.join(__dirname, '../property.env') });

// Import DB only after env is loaded
const { default: connectDB } = await import('./db/index.js');

await connectDB();

const PORT = Number.parseInt(process.env.PORT, 10) || 3007;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
