const sequelize = require('./database');
const { User, Tenant, Project, Task } = require('../models');

async function initializeDatabase() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Run migrations if needed
    if (process.env.NODE_ENV === 'development') {
      // Check if Users table exists
      const tableExists = await sequelize.query(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='Users'",
        { type: sequelize.QueryTypes.SELECT }
      );

      if (tableExists.length === 0) {
        console.log('🔄 Creating database tables...');
        await sequelize.sync({ force: true });
        console.log('✅ Database tables created successfully.');
        
        // Create default tenant
        await Tenant.create({
          id: 1,
          name: 'Default Tenant'
        });
        console.log('✅ Default tenant created.');
        
      } else {
        console.log('✅ Database tables already exist.');
        // Just sync without force to avoid backup table issues
        await sequelize.sync();
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

module.exports = { initializeDatabase }; 