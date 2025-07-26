import React from 'react';
import { Task } from '../../types';

interface TaskListProps {
  tasks: Task[];
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: number) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskEdit, onTaskDelete }) => {
  if (tasks.length === 0) {
    return <div className="text-gray-500">No tasks for this project.</div>;
  }
  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <div key={task.id} className="p-4 bg-gray-50 rounded shadow flex justify-between items-center">
          <div>
            <div className="font-medium text-gray-900">{task.title}</div>
            <div className="text-gray-600 text-sm">{task.description}</div>
            <div className="text-xs mt-1">
              Status: <span className="font-semibold">{task.status}</span> | Priority: <span className="font-semibold">{task.priority}</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="btn-secondary" onClick={() => onTaskEdit(task)}>Edit</button>
            <button className="btn-danger" onClick={() => onTaskDelete(task.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList; 