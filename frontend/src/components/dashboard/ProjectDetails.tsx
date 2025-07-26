import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { projectsAPI, tasksAPI } from '../../services/api';
import { Project, Task } from '../../types';
import TaskList from './TaskList';
import TaskForm from './TaskForm';

const ProjectDetails: React.FC = () => {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    if (id) fetchData(Number(id));
  }, [id]);

  const fetchData = async (projectId: number) => {
    setLoading(true);
    try {
      const [projectRes, tasksRes] = await Promise.all([
        projectsAPI.getById(projectId),
        tasksAPI.getAll(projectId),
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load project or tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreate = async (data: any) => {
    if (!id) return;
    try {
      const res = await tasksAPI.create(Number(id), data);
      setTasks([...tasks, res.data]);
      setShowTaskForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleTaskUpdate = async (data: any) => {
    if (!id || !editingTask) return;
    try {
      const res = await tasksAPI.update(Number(id), editingTask.id, data);
      setTasks(tasks.map(t => t.id === editingTask.id ? res.data : t));
      setEditingTask(null);
      setShowTaskForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update task');
    }
  };

  const handleTaskDelete = async (taskId: number) => {
    if (!id) return;
    if (!window.confirm('Delete this task?')) return;
    try {
      await tasksAPI.delete(Number(id), taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete task');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;
  if (!project) return <div className="text-center py-8">Project not found.</div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">{project.name}</h1>
      <div className="mb-4 text-gray-700">{project.description}</div>
      <div className="mb-8">
        <span className="inline-block px-3 py-1 rounded-full bg-primary-100 text-primary-800 text-xs font-medium">
          Status: {project.status}
        </span>
      </div>
      <h2 className="text-xl font-semibold mb-4">Tasks</h2>
      <div className="mb-4">
        <button className="btn-primary" onClick={() => { setShowTaskForm(true); setEditingTask(null); }}>+ Add Task</button>
      </div>
      <TaskList tasks={tasks} onTaskEdit={handleTaskEdit} onTaskDelete={handleTaskDelete} />
      {showTaskForm && (
        <div className="mt-6 bg-white p-6 rounded shadow">
          <TaskForm
            onSubmit={editingTask ? handleTaskUpdate : handleTaskCreate}
            onCancel={() => { setShowTaskForm(false); setEditingTask(null); }}
            initialData={editingTask || undefined}
          />
        </div>
      )}
    </div>
  );
};

export default ProjectDetails; 