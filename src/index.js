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

const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log('Server is running on port:', PORT);
// });

app.listen(3002, "0.0.0.0", () => {
  console.log("Server running on port 3002");
});
