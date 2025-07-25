const User = require('./user');
const Tenant = require('./tenant');
const Project = require('./project');
const Task = require('./task');

// Define associations
User.belongsTo(Tenant, { foreignKey: 'tenant_id' });
Tenant.hasMany(User, { foreignKey: 'tenant_id' });

Project.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Project.belongsTo(Tenant, { foreignKey: 'tenant_id' });
User.hasMany(Project, { foreignKey: 'created_by' });
Tenant.hasMany(Project, { foreignKey: 'tenant_id' });

Task.belongsTo(Project, { foreignKey: 'project_id' });
Task.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });
Task.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Project.hasMany(Task, { foreignKey: 'project_id' });
User.hasMany(Task, { foreignKey: 'assigned_to' });
User.hasMany(Task, { foreignKey: 'created_by' });

Tenant.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
User.hasMany(Tenant, { foreignKey: 'created_by' });

module.exports = {
  User,
  Tenant,
  Project,
  Task
};
