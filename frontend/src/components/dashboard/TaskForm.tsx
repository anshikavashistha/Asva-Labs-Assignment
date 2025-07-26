import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Task } from '../../types';

const schema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().optional(),
  status: yup.string().oneOf(['pending', 'in-progress', 'completed']).optional(),
  priority: yup.string().oneOf(['low', 'medium', 'high']).optional(),
  due_date: yup.string().optional(),
  assigned_to: yup.number().optional(),
});

type TaskFormData = {
  title: string;
  description?: string;
  status?: 'pending' | 'in-progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  assigned_to?: number;
};

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  initialData?: Task;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<TaskFormData>({
    resolver: yupResolver(schema),
    defaultValues: initialData || { status: 'pending', priority: 'medium' },
  });

  return (
    <form onSubmit={handleSubmit((data) => { onSubmit(data); reset(); })} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title *</label>
        <input {...register('title')} className="input-field" placeholder="Task title" />
        {errors.title && <p className="text-red-600 text-sm">{errors.title.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea {...register('description')} className="input-field" placeholder="Task description" />
      </div>
      <div className="flex space-x-2">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select {...register('status')} className="input-field">
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Priority</label>
          <select {...register('priority')} className="input-field">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Due Date</label>
        <input type="date" {...register('due_date')} className="input-field" />
      </div>
      <div className="flex justify-end space-x-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>{initialData ? 'Update' : 'Create'} Task</button>
      </div>
    </form>
  );
};

export default TaskForm; 