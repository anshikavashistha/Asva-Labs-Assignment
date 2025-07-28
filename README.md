# Project Management Tool - Multi-Tenant SaaS

A full-stack project management application with role-based access control, caching, and event-driven architecture.

## 🚀 Features

- **Multi-tenant architecture** with tenant isolation
- **Role-based access control** (Admin/User roles)
- **JWT authentication** with secure token management
- **Redis caching** for improved performance
- **Kafka event streaming** for event-driven design
- **PostgreSQL database** with migrations
- **React frontend** with modern UI/UX
- **Docker Compose** for easy local development

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   SQLite        │
│   (React)       │◄──►│   (Node.js)     │◄──►│   Database      │
│   Port: 80      │    │   Port: 3000    │    │   (File-based)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │     Redis       │    │     Kafka       │
                       │   Cache         │    │   Events        │
                       │   Port: 6379    │    │   Port: 9092    │
                       └─────────────────┘    └─────────────────┘
```

## 🐳 Docker Setup

### Prerequisites

- Docker
- Docker Compose

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Asva-Labs-Assignment
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:3000
   - Health Check: http://localhost/health

### Services

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 80 | React application with nginx |
| Backend | 3000 | Node.js REST API |
| SQLite | - | File-based database |
| Redis | 6379 | Cache |
| Kafka | 9092 | Event streaming |
| Zookeeper | 2181 | Kafka coordination |

## 🔧 Development

### Local Development (without Docker)

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

### Docker Development

```bash
# Build and start services
docker-compose up --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild specific service
docker-compose up --build backend
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Project Endpoints

- `GET /api/projects` - Get all projects (cached)
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project by ID
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Task Endpoints

- `GET /api/projects/:projectId/tasks` - Get project tasks
- `POST /api/projects/:projectId/tasks` - Create task
- `GET /api/projects/:projectId/tasks/:id` - Get task by ID
- `PUT /api/projects/:projectId/tasks/:id` - Update task
- `DELETE /api/projects/:projectId/tasks/:id` - Delete task

## 🔐 Authentication

The application uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🎭 Role-Based Access Control

- **Admin Role**: Full CRUD access to all projects and tasks
- **User Role**: Read-only access to projects and tasks

## 🗄️ Database

The application uses SQLite for both development and production. Database migrations are handled by Sequelize.

### Running Migrations

```bash
# Local development
cd backend
npx sequelize-cli db:migrate

# Docker environment
docker-compose exec backend npx sequelize-cli db:migrate
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📊 Monitoring

- **Health Check**: http://localhost/health
- **Backend Health**: http://localhost:3000/health

## 🔧 Environment Variables

### Backend (.env)
```
NODE_ENV=production
PORT=3000
REDIS_URL=redis://redis:6379
KAFKA_BROKER=kafka:9092
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### Frontend (.env)
```
REACT_APP_API_URL=/api
```

## 🚀 Deployment

The application is containerized and ready for deployment to any container orchestration platform (Kubernetes, Docker Swarm, etc.).

### Production Considerations

1. **Security**: Change default passwords and JWT secret
2. **SSL/TLS**: Configure HTTPS in production
3. **Database**: Use managed PostgreSQL service
4. **Caching**: Use managed Redis service
5. **Monitoring**: Add application monitoring and logging

## 📝 License

This project is licensed under the MIT License.