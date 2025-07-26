const { User } = require('../models');

const UserService = {
  async findByEmail(email) {
    return User.findOne({ where: { email } });
  },
  async findById(id) {
    return User.findByPk(id);
  },
  async createUser(data) {
    return User.create(data);
  },
  async getAllUsers() {
    return User.findAll();
  },
  async updateUser(id, data) {
    return User.update(data, { where: { id } });
  },
  async deleteUser(id) {
    return User.destroy({ where: { id } });
  }
};

module.exports = UserService; 