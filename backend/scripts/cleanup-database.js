const sequelize = require('../src/config/database');
const fs = require('fs');
const path = require('path');

async function cleanupDatabase() {
  try {
    console.log('🧹 Starting database cleanup...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Get all table names
    const tables = await sequelize.query(
      "SELECT name FROM sqlite_master WHERE type='table'",
      { type: sequelize.QueryTypes.SELECT }
    );

    console.log('📋 Found tables:', tables.map(t => t.name));

    // Check for backup tables
    const backupTables = tables.filter(table => 
      table.name.includes('_backup') || 
      table.name.includes('_backup_') ||
      table.name.includes('_old')
    );

    if (backupTables.length > 0) {
      console.log('🗑️  Found backup tables:', backupTables.map(t => t.name));
      
      // Drop backup tables
      for (const table of backupTables) {
        await sequelize.query(`DROP TABLE IF EXISTS "${table.name}"`);
        console.log(`✅ Dropped backup table: ${table.name}`);
      }
    } else {
      console.log('✅ No backup tables found.');
    }

    // Check for duplicate records in Users table
    const duplicateUsers = await sequelize.query(
      "SELECT id, COUNT(*) as count FROM Users GROUP BY id HAVING COUNT(*) > 1",
      { type: sequelize.QueryTypes.SELECT }
    );

    if (duplicateUsers.length > 0) {
      console.log('⚠️  Found duplicate user IDs:', duplicateUsers);
      
      // Keep only the first occurrence of each ID
      for (const duplicate of duplicateUsers) {
        await sequelize.query(`
          DELETE FROM Users 
          WHERE id = ? AND rowid NOT IN (
            SELECT MIN(rowid) FROM Users WHERE id = ?
          )
        `, {
          replacements: [duplicate.id, duplicate.id],
          type: sequelize.QueryTypes.DELETE
        });
        console.log(`✅ Cleaned up duplicates for ID: ${duplicate.id}`);
      }
    } else {
      console.log('✅ No duplicate users found.');
    }

    // Verify tables are working
    const userCount = await sequelize.query(
      "SELECT COUNT(*) as count FROM Users",
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log(`✅ Users table has ${userCount[0].count} records.`);
    console.log('✅ Database cleanup completed successfully!');

  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run cleanup if this script is executed directly
if (require.main === module) {
  cleanupDatabase()
    .then(() => {
      console.log('🎉 Cleanup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Cleanup failed:', error);
      process.exit(1);
    });
}

module.exports = { cleanupDatabase }; 