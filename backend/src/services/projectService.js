const { Project } = require('../models');

const ProjectService = {
  async findById(id) {
    return Project.findByPk(id);
  },
  async createProject(data) {
    return Project.create(data);
  },
  async getAllProjects() {
    return Project.findAll();
  },
  async updateProject(id, data) {
    return Project.update(data, { where: { id } });
  },
  async deleteProject(id) {
    return Project.destroy({ where: { id } });
  }
};

module.exports = ProjectService; 