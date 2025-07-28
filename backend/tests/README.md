# Backend Tests

This directory contains comprehensive unit tests for the Project Management Tool backend API.

## Test Structure

```
tests/
├── setup.js                    # Test environment setup
├── controllers/                # Controller tests
│   ├── authController.test.js  # Authentication controller tests
│   ├── projectController.test.js # Project controller tests
│   └── taskController.test.js  # Task controller tests
├── services/                   # Service layer tests
│   └── userService.test.js     # User service tests
└── middlewares/               # Middleware tests
    └── auth.test.js           # Authentication middleware tests
```

## Test Coverage

The tests cover the following areas:

### Controllers
- **AuthController**: Registration, login, and profile management
- **ProjectController**: CRUD operations for projects with role-based permissions
- **TaskController**: CRUD operations for tasks with role-based permissions

### Services
- **UserService**: User data access layer operations

### Middlewares
- **Auth Middleware**: JWT token authentication and role-based authorization

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### With Coverage Report
```bash
npm run test:coverage
```

### CI Mode (for continuous integration)
```bash
npm run test:ci
```

## Test Features

### Mocking Strategy
- All external dependencies (database, JWT, bcrypt) are mocked
- Service layer is mocked for controller tests
- Database models are mocked for service tests

### Test Categories
1. **Happy Path Tests**: Successful operations
2. **Error Handling Tests**: Database errors, validation errors
3. **Authorization Tests**: Role-based access control
4. **Edge Cases**: Invalid inputs, missing data

### Authentication Tests
- Valid token authentication
- Invalid/missing token handling
- Token expiration handling
- User role verification

### Authorization Tests
- Admin vs User permissions
- Resource ownership validation
- Role-based route protection

## Test Data

Tests use realistic mock data that represents:
- User accounts with different roles (admin, user)
- Projects with various states
- Tasks with different assignments and statuses
- JWT tokens with proper payload structure

## Coverage Goals

The test suite aims for:
- **90%+ Code Coverage** for critical business logic
- **100% Coverage** for authentication and authorization
- **Comprehensive Error Handling** for all edge cases

## Adding New Tests

When adding new functionality:

1. **Controllers**: Test all CRUD operations, error handling, and authorization
2. **Services**: Test database operations and error scenarios
3. **Middlewares**: Test authentication and authorization logic
4. **Edge Cases**: Always include tests for invalid inputs and error conditions

### Test Template
```javascript
describe('Feature', () => {
  it('should handle successful operation', async () => {
    // Arrange
    // Act
    // Assert
  });

  it('should handle error condition', async () => {
    // Arrange
    // Act
    // Assert
  });
});
```

## Best Practices

1. **Isolation**: Each test is independent and doesn't rely on other tests
2. **Mocking**: External dependencies are properly mocked
3. **Clear Naming**: Test names clearly describe what is being tested
4. **AAA Pattern**: Arrange, Act, Assert structure
5. **Error Testing**: Always test both success and failure scenarios 