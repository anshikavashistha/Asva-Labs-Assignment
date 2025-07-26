const { Task } = require('../models');

const TaskService = {
  async findById(id) {
    return Task.findByPk(id);
  },
  async createTask(data) {
    return Task.create(data);
  },
  async getAllTasks() {
    return Task.findAll();
  },
  async updateTask(id, data) {
    return Task.update(data, { where: { id } });
  },
  async deleteTask(id) {
    return Task.destroy({ where: { id } });
  }
};

module.exports = TaskService; 