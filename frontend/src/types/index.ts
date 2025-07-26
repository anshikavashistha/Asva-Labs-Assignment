export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  tenant_id: number;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'on-hold';
  created_by: number;
  tenant_id: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  project_id: number;
  assigned_to?: number;
  created_by: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  tenant_id: number;
}

export interface ProjectForm {
  name: string;
  description?: string;
  status?: string;
  tenant_id: number;
}

export interface TaskForm {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  due_date?: string;
  assigned_to?: number;
} 