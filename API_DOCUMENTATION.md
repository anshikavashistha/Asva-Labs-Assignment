# API Documentation

## Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

## Authentication

All API endpoints require authentication via JWT token, except for login and register endpoints.

Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "tenant_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user",
    "tenant_id": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Login User
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "role": "user",
      "tenant_id": 1
    }
  }
}
```

#### Get User Profile
```http
GET /api/auth/profile
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user",
    "tenant_id": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Projects

#### Get All Projects (Cached)
```http
GET /api/projects
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Project Alpha",
      "description": "A revolutionary project",
      "status": "active",
      "tenant_id": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get Project by ID
```http
GET /api/projects/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Project Alpha",
    "description": "A revolutionary project",
    "status": "active",
    "tenant_id": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Create Project
```http
POST /api/projects
```

**Request Body:**
```json
{
  "name": "New Project",
  "description": "Project description",
  "status": "active",
  "tenant_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "id": 2,
    "name": "New Project",
    "description": "Project description",
    "status": "active",
    "tenant_id": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Update Project
```http
PUT /api/projects/:id
```

**Request Body:**
```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "status": "completed"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": {
    "id": 1,
    "name": "Updated Project Name",
    "description": "Updated description",
    "status": "completed",
    "tenant_id": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Delete Project
```http
DELETE /api/projects/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

### Tasks

#### Get All Tasks for Project
```http
GET /api/projects/:projectId/tasks
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Implement Authentication",
      "description": "Add JWT authentication",
      "status": "in_progress",
      "priority": "high",
      "due_date": "2024-02-01T00:00:00.000Z",
      "assigned_to": 1,
      "project_id": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get Task by ID
```http
GET /api/projects/:projectId/tasks/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Implement Authentication",
    "description": "Add JWT authentication",
    "status": "in_progress",
    "priority": "high",
    "due_date": "2024-02-01T00:00:00.000Z",
    "assigned_to": 1,
    "project_id": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Create Task
```http
POST /api/projects/:projectId/tasks
```

**Request Body:**
```json
{
  "title": "New Task",
  "description": "Task description",
  "status": "todo",
  "priority": "medium",
  "due_date": "2024-02-01T00:00:00.000Z",
  "assigned_to": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": 2,
    "title": "New Task",
    "description": "Task description",
    "status": "todo",
    "priority": "medium",
    "due_date": "2024-02-01T00:00:00.000Z",
    "assigned_to": 1,
    "project_id": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Update Task
```http
PUT /api/projects/:projectId/tasks/:id
```

**Request Body:**
```json
{
  "title": "Updated Task Title",
  "description": "Updated task description",
  "status": "completed",
  "priority": "low"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": 1,
    "title": "Updated Task Title",
    "description": "Updated task description",
    "status": "completed",
    "priority": "low",
    "due_date": "2024-02-01T00:00:00.000Z",
    "assigned_to": 1,
    "project_id": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Delete Task
```http
DELETE /api/projects/:projectId/tasks/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

## Error Responses

### Validation Error
```json
{
  "success": false,
  "error": "Validation error",
  "details": {
    "field": "error message"
  }
}
```

### Authentication Error
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or missing token"
}
```

### Authorization Error
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### Not Found Error
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Resource not found"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

The API implements rate limiting to prevent abuse:
- 100 requests per minute per IP address
- 1000 requests per hour per user

## Caching

- GET `/api/projects` is cached in Redis for 1 minute
- Cache is automatically invalidated on project create/update/delete operations

## Event Streaming

The following operations trigger Kafka events:
- Project create/update/delete
- Task create/update/delete
- User registration/login

Events are published to the following topics:
- `project-events`
- `task-events`
- `user-events` 