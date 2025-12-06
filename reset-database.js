#!/usr/bin/env node

/**
 * Database Reset Script
 * This script will help you reset your database to fix the "Multiple primary key defined" error
 */

import { sequelize } from './src/db/index.js';

const resetDatabase = async () => {
  try {
    console.log('🔄 Resetting database...');
    
    // Drop all tables in the correct order (respecting foreign key constraints)
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    const tables = [
      'message_logs',
      'campaigns', 
      'templates',
      'customers',
      'businesses',
      'employees',
      'users'
    ];
    
    for (const table of tables) {
      try {
        await sequelize.query(`DROP TABLE IF EXISTS ${table}`);
        console.log(`✅ Dropped table: ${table}`);
      } catch (error) {
        console.log(`⚠️  Table ${table} doesn't exist or already dropped`);
      }
    }
    
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('✅ Database reset completed successfully!');
    console.log('🚀 You can now start your application and it will create fresh tables.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
};

// Run the reset
resetDatabase();
