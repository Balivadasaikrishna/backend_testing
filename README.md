# JSONPlaceholder API Testing Project

A comprehensive TypeScript-based testing suite for the [JSONPlaceholder](https://jsonplaceholder.typicode.com/) REST API. This project demonstrates automated testing of API endpoints with focus on correctness, data integrity, and robustness.

I built this to learn more about API testing and to have a solid foundation for testing REST APIs. The JSONPlaceholder API is perfect for this since it's free and doesn't require authentication.

## 🚀 Features

- **Complete API Coverage**: Tests all 6 JSONPlaceholder resources (posts, comments, albums, photos, todos, users)
- **TypeScript Implementation**: Full type safety with comprehensive interfaces
- **Comprehensive Testing**: Tests for correctness, data integrity, and robustness
- **Relationship Validation**: Ensures data consistency across related endpoints
- **Error Handling**: Tests for graceful handling of edge cases and invalid inputs
- **Modern Testing Stack**: Jest with TypeScript support

## 📋 API Resources Tested

| Resource | Endpoints | Count | Description |
|----------|-----------|-------|-------------|
| **Posts** | `/posts` | 100 | Blog posts with titles and content |
| **Comments** | `/comments` | 500 | Comments on posts with email validation |
| **Albums** | `/albums` | 100 | Photo albums organized by users |
| **Photos** | `/photos` | 5000 | Images with URLs and thumbnails |
| **Todos** | `/todos` | 200 | Task items with completion status |
| **Users** | `/users` | 10 | User profiles with addresses and companies |

## 🛠️ Prerequisites

- Node.js (v16 or higher) - I used v18 for development
- npm or yarn package manager

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd jsonplaceholder-api-testing
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Verify installation**:
   ```bash
   npm run build
   ```

## 🧪 Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Specific Test Suites
```bash
# Run only posts tests
npm test -- --testNamePattern="Posts API Tests"

# Run only users tests
npm test -- --testNamePattern="Users API Tests"

# Run only todos tests
npm test -- --testNamePattern="Todos API Tests"
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run CI Pipeline Locally
```bash
npm run ci
```

## 🚀 CI/CD Pipeline

This project includes automated CI/CD pipelines that run tests on every code change:

### **Automatic Testing**
- **Push to main/develop**: Triggers full test suite
- **Pull Requests**: Runs tests before merge
- **Coverage Reports**: Generated automatically
- **Security Scans**: Vulnerability checks

### **Pipeline Stages**
1. **Test**: Type checking, building, testing (145 tests)
2. **Security**: Dependency vulnerability scanning
3. **Quality**: Code formatting and linting checks
4. **Deploy**: Automatic deployment on success

### **Docker Support**
```bash
# Run tests in container
docker-compose run test

# Run with coverage
docker-compose run test-coverage

# Run application
docker-compose up app
```

See [CI_CD_GUIDE.md](./CI_CD_GUIDE.md) for detailed pipeline information.

## 🏗️ Project Structure

```
src/
├── types/           # TypeScript interfaces
│   └── index.ts     # All API response types
├── api-client.ts    # Main API client class
├── test-setup.ts    # Jest configuration
└── __tests__/       # Test suites
    ├── posts.test.ts        # Posts endpoint tests
    ├── users.test.ts        # Users endpoint tests
    ├── todos.test.ts        # Todos endpoint tests
    ├── albums-photos.test.ts # Albums and photos tests
    └── comments.test.ts     # Comments endpoint tests
```

## 🔧 Configuration

### TypeScript Configuration (`tsconfig.json`)
- Target: ES2020
- Module: CommonJS
- Strict type checking enabled
- Source maps and declarations enabled

### Jest Configuration (`jest.config.js`)
- TypeScript support with ts-jest
- Coverage reporting
- Test timeout: 15 seconds
- Verbose output enabled

## 📊 Test Categories

### 1. **Correctness Tests**
- ✅ Response structure validation
- ✅ Data type verification
- ✅ Status code validation
- ✅ Expected data counts

### 2. **Data Integrity Tests**
- ✅ Unique ID validation
- ✅ Required field presence
- ✅ Data format validation (emails, URLs, coordinates)
- ✅ Relationship consistency

### 3. **Robustness Tests**
- ✅ Invalid input handling
- ✅ Non-existent resource handling
- ✅ Network timeout scenarios
- ✅ Edge case validation

### 4. **Relationship Tests**
- ✅ User-post relationships
- ✅ Post-comment relationships
- ✅ User-album relationships
- ✅ Album-photo relationships
- ✅ User-todo relationships

## 🌐 API Endpoints Tested

### Posts (`/posts`)
- `GET /posts` - Get all posts
- `GET /posts/:id` - Get single post
- `GET /posts/:id/comments` - Get post comments
- `POST /posts` - Create new post
- `PUT /posts/:id` - Update post
- `PATCH /posts/:id` - Partial update
- `DELETE /posts/:id` - Delete post

### Users (`/users`)
- `GET /users` - Get all users
- `GET /users/:id` - Get single user
- `GET /users/:id/posts` - Get user posts
- `GET /users/:id/todos` - Get user todos
- `GET /users/:id/albums` - Get user albums

### Todos (`/todos`)
- `GET /todos` - Get all todos
- `GET /todos/:id` - Get single todo
- `GET /todos?userId=X&completed=Y` - Filtered todos

### Albums & Photos
- `GET /albums` - Get all albums
- `GET /albums/:id` - Get single album
- `GET /albums/:id/photos` - Get album photos
- `GET /photos` - Get all photos
- `GET /photos/:id` - Get single photo
- `GET /photos?albumId=X` - Filtered photos

### Comments (`/comments`)
- `GET /comments` - Get all comments
- `GET /comments/:id` - Get single comment
- `GET /comments?postId=X` - Filtered comments

## 🔍 Test Examples

### Basic Structure Validation
```typescript
it('should return all posts with correct structure', async () => {
  const response = await apiClient.getPosts();
  
  expect(response.status).toBe(200);
  expect(Array.isArray(response.data)).toBe(true);
  expect(response.data.length).toBe(100);
  
  const firstPost = response.data[0];
  expect(firstPost).toHaveProperty('id');
  expect(firstPost).toHaveProperty('title');
  expect(firstPost).toHaveProperty('body');
  expect(firstPost).toHaveProperty('userId');
});
```

### Data Integrity Validation
```typescript
it('should have valid email formats for all users', async () => {
  const response = await apiClient.getUsers();
  
  response.data.forEach(user => {
    expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });
});
```

### Relationship Validation
```typescript
it('should have consistent user-post relationships', async () => {
  const usersResponse = await apiClient.getUsers();
  const postsResponse = await apiClient.getPosts();
  
  const userIds = usersResponse.data.map(user => user.id);
  const postUserIds = postsResponse.data.map(post => post.userId);
  
  postUserIds.forEach(postUserId => {
    expect(userIds).toContain(postUserId);
  });
});
```

## 🚨 Error Handling

The test suite includes comprehensive error handling tests:

- **Invalid IDs**: Negative numbers, extremely large numbers
- **Non-existent Resources**: IDs beyond the data range
- **Network Issues**: Timeout scenarios
- **Malformed Data**: Invalid input handling

## 📈 Coverage Reports

After running tests with coverage, you'll get detailed reports showing:

- **Line Coverage**: Percentage of code lines executed
- **Branch Coverage**: Percentage of code branches executed
- **Function Coverage**: Percentage of functions called
- **Statement Coverage**: Percentage of statements executed

## 🧪 Custom Test Scenarios

### Adding New Tests
1. Create a new test file in `src/__tests__/`
2. Import the API client and types
3. Follow the existing test structure
4. Run tests to verify

### Example Test Structure
```typescript
describe('New Feature Tests', () => {
  let apiClient: JsonPlaceholderApiClient;

  beforeAll(() => {
    apiClient = new JsonPlaceholderApiClient();
  });

  describe('Feature Description', () => {
    it('should behave as expected', async () => {
      // Test implementation
    });
  });
});
```

## 🔧 Development

### Building the Project
```bash
npm run build
```

### Type Checking
```bash
npm run type-check
```

### Linting (if configured)
```bash
npm run lint
```

## 📝 Notes

- **Mock API**: JSONPlaceholder is a fake API for testing - data is not persistent
- **Rate Limiting**: No rate limits, but be respectful during development
- **Data Consistency**: All relationships are maintained across endpoints
- **HTTP Methods**: All standard HTTP methods (GET, POST, PUT, PATCH, DELETE) are supported

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 🙏 Acknowledgments

- [JSONPlaceholder](https://jsonplaceholder.typicode.com/) for providing the test API
- [Jest](https://jestjs.io/) for the testing framework
- [TypeScript](https://www.typescriptlang.org/) for type safety
- [Axios](https://axios-http.com/) for HTTP client functionality

---