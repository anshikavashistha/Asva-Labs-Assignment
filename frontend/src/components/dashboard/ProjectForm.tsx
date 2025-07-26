import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { projectsAPI } from '../../services/api';
import { Project, User } from '../../types';
import { X } from 'lucide-react';

const schema = yup.object({
  name: yup.string().required('Project name is required'),
  description: yup.string().optional(),
  status: yup.string().oneOf(['active', 'completed', 'on-hold']).optional(),
  tenant_id: yup.number().required('Tenant ID is required'),
}).required();

type ProjectFormData = {
  name: string;
  description?: string;
  status?: 'active' | 'completed' | 'on-hold';
  tenant_id: number;
};

interface ProjectFormProps {
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
  user: User | null;
  project?: Project; // For editing
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  onClose,
  onProjectCreated,
  user,
  project,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProjectFormData>({
    resolver: yupResolver(schema),
    defaultValues: project ? {
      name: project.name,
      description: project.description || '',
      status: project.status,
      tenant_id: project.tenant_id,
    } : {
      status: 'active',
      tenant_id: user?.tenant_id || 1,
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    try {
      if (project) {
        // Update existing project
        const response = await projectsAPI.update(project.id, {
          name: data.name,
          description: data.description,
          status: data.status,
        });
        onProjectCreated(response.data);
      } else {
        // Create new project
        const response = await projectsAPI.create({
          name: data.name,
          description: data.description,
          status: data.status,
          tenant_id: data.tenant_id,
        });
        onProjectCreated(response.data);
      }
      reset();
    } catch (error: any) {
      console.error('Failed to save project:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {project ? 'Edit Project' : 'Create New Project'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Project Name *
            </label>
            <input
              {...register('name')}
              type="text"
              className="input-field"
              placeholder="Enter project name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="input-field"
              placeholder="Enter project description"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              {...register('status')}
              className="input-field"
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
            )}
          </div>

          {!project && (
            <div>
              <label htmlFor="tenant_id" className="block text-sm font-medium text-gray-700">
                Tenant ID *
              </label>
              <input
                {...register('tenant_id')}
                type="number"
                className="input-field"
                placeholder="Enter tenant ID"
              />
              {errors.tenant_id && (
                <p className="mt-1 text-sm text-red-600">{errors.tenant_id.message}</p>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm; 