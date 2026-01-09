/**
 * One-time migration:
 * Set businessId of ALL departments to the Business whose businessName matches:
 *   "Seecog softwares private limited" (case-insensitive).
 *
 * Usage:
 *   npm run update-departments-business
 *
 * Notes:
 * - Uses the same property.env loading as the app.
 * - Updates even soft-deleted departments (paranoid: false).
 */

import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Op, Sequelize } from 'sequelize';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from repo root property.env
dotenv.config({ path: path.join(__dirname, '../property.env') });

// Import DB + models after env is loaded
const { default: connectDB, sequelize } = await import('../src/db/index.js');
const { Business, Department } = await import('../src/models/index.js');

const TARGET_NAME = 'Seecog softwares private limited';

function norm(s) {
  return String(s || '').trim().toLowerCase();
}

async function main() {
  await connectDB();

  const targetLower = norm(TARGET_NAME);

  // Case-insensitive exact match on businessName
  const matches = await Business.findAll({
    where: Sequelize.where(
      Sequelize.fn('LOWER', Sequelize.col('businessName')),
      targetLower
    ),
    attributes: ['id', 'businessName'],
  });

  if (!matches.length) {
    console.error(`❌ No Business found with businessName "${TARGET_NAME}" (case-insensitive).`);
    process.exitCode = 1;
    return;
  }

  if (matches.length > 1) {
    console.error(`❌ Multiple Businesses match "${TARGET_NAME}". Please disambiguate:`);
    matches.forEach((b) => console.error(`- id=${b.id} businessName="${b.businessName}"`));
    process.exitCode = 1;
    return;
  }

  const targetBiz = matches[0];
  const targetId = targetBiz.id;

  const totalDepartments = await Department.count({ paranoid: false });
  const needsUpdate = await Department.count({
    where: { businessId: { [Op.ne]: targetId } },
    paranoid: false,
  });

  console.log(`✅ Target business: id=${targetId} businessName="${targetBiz.businessName}"`);
  console.log(`ℹ️ Departments total (including deleted): ${totalDepartments}`);
  console.log(`ℹ️ Departments needing update: ${needsUpdate}`);

  if (needsUpdate === 0) {
    console.log('✅ Nothing to do.');
    return;
  }

  const tx = await sequelize.transaction();
  try {
    const [updatedCount] = await Department.update(
      { businessId: targetId },
      { where: {}, paranoid: false, transaction: tx }
    );

    await tx.commit();
    console.log(`✅ Updated departments: ${updatedCount}`);
  } catch (e) {
    await tx.rollback();
    console.error('❌ Update failed:', e?.message || e);
    process.exitCode = 1;
  }
}

main()
  .catch((e) => {
    console.error('❌ Migration crashed:', e?.message || e);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await sequelize.close();
    } catch {}
  });


