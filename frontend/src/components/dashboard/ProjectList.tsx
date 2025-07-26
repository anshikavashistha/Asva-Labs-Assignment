import React, { useState } from 'react';
import { Project } from '../../types';
import ProjectCard from './ProjectCard';
import { FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProjectListProps {
  projects: Project[];
  onProjectUpdated: (project: Project) => void;
  onProjectDeleted: (projectId: number) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onProjectUpdated,
  onProjectDeleted,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const navigate = useNavigate();

  const filteredProjects = selectedStatus === 'all' 
    ? projects 
    : projects.filter(project => project.status === selectedStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new project.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Filter */}
      <div className="mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedStatus === 'all'
                ? 'bg-primary-100 text-primary-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({projects.length})
          </button>
          <button
            onClick={() => setSelectedStatus('active')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedStatus === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active ({projects.filter(p => p.status === 'active').length})
          </button>
          <button
            onClick={() => setSelectedStatus('completed')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedStatus === 'completed'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completed ({projects.filter(p => p.status === 'completed').length})
          </button>
          <button
            onClick={() => setSelectedStatus('on-hold')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedStatus === 'on-hold'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            On Hold ({projects.filter(p => p.status === 'on-hold').length})
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} onClick={() => navigate(`/projects/${project.id}`)} className="cursor-pointer">
            <ProjectCard
              project={project}
              onProjectUpdated={onProjectUpdated}
              onProjectDeleted={onProjectDeleted}
            />
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && projects.length > 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No projects match the selected filter.</p>
        </div>
      )}
    </div>
  );
};

export default ProjectList; 