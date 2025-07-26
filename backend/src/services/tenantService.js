const { Tenant } = require('../models');

const TenantService = {
  async findById(id) {
    return Tenant.findByPk(id);
  },
  async createTenant(data) {
    return Tenant.create(data);
  },
  async getAllTenants() {
    return Tenant.findAll();
  },
  async updateTenant(id, data) {
    return Tenant.update(data, { where: { id } });
  },
  async deleteTenant(id) {
    return Tenant.destroy({ where: { id } });
  }
};

module.exports = TenantService; 