import { JsonPlaceholderApiClient } from '../api-client';
import { Todo } from '../types';

// Testing the Todos API endpoints
// This covers todo CRUD operations and filtering
describe('Todos API Tests', () => {
  let apiClient: JsonPlaceholderApiClient;

  beforeAll(() => {
    apiClient = new JsonPlaceholderApiClient();
  });

  describe('GET /todos - Get All Todos', () => {
    it('should return all todos with correct structure', async () => {
      const response = await apiClient.getTodos();
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBe(200);
      
      // Check the first todo has all required fields
      const firstTodo = response.data[0];
      expect(firstTodo).toHaveProperty('id');
      expect(firstTodo).toHaveProperty('title');
      expect(firstTodo).toHaveProperty('completed');
      expect(firstTodo).toHaveProperty('userId');
      
      // Verify data types
      expect(typeof firstTodo.id).toBe('number');
      expect(typeof firstTodo.title).toBe('string');
      expect(typeof firstTodo.completed).toBe('boolean');
      expect(typeof firstTodo.userId).toBe('number');
    });

    it('should have todos with IDs 1-200', async () => {
      const response = await apiClient.getTodos();
      const ids = response.data.map(todo => todo.id);
      
      expect(Math.min(...ids)).toBe(1);
      expect(Math.max(...ids)).toBe(200);
    });

    it('should have valid completed status values', async () => {
      const response = await apiClient.getTodos();
      
      response.data.forEach(todo => {
        expect(typeof todo.completed).toBe('boolean');
      });
    });
  });

  describe('GET /todos/:id - Get Single Todo', () => {
    it('should return a specific todo by ID', async () => {
      const todoId = 1;
      const response = await apiClient.getTodo(todoId);
      
      expect(response.status).toBe(200);
      expect(response.data.id).toBe(todoId);
      expect(response.data.title).toBeTruthy();
      expect(typeof response.data.completed).toBe('boolean');
      expect(response.data.userId).toBeGreaterThan(0);
    });

    it('should return todo with ID 100', async () => {
      const response = await apiClient.getTodo(100);
      expect(response.data.id).toBe(100);
    });

    it('should return todo with ID 200', async () => {
      const response = await apiClient.getTodo(200);
      expect(response.data.id).toBe(200);
    });

    it('should handle non-existent todo gracefully', async () => {
      await expect(apiClient.getTodo(999)).rejects.toThrow();
    });
  });

  describe('GET /todos with Query Parameters', () => {
    it('should filter todos by userId', async () => {
      const userId = 1;
      const response = await apiClient.getTodos({ userId });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBe(20);
      
      // All todos should belong to the specified user
      response.data.forEach(todo => {
        expect(todo.userId).toBe(userId);
      });
    });

    it('should filter todos by completed status (true)', async () => {
      const completed = true;
      const response = await apiClient.getTodos({ completed });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      
      response.data.forEach(todo => {
        expect(todo.completed).toBe(true);
      });
    });

    it('should filter todos by completed status (false)', async () => {
      const completed = false;
      const response = await apiClient.getTodos({ completed });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      
      response.data.forEach(todo => {
        expect(todo.completed).toBe(false);
      });
    });

    it('should filter todos by both userId and completed status', async () => {
      const userId = 1;
      const completed = false;
      const response = await apiClient.getTodos({ userId, completed });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      
      response.data.forEach(todo => {
        expect(todo.userId).toBe(userId);
        expect(todo.completed).toBe(completed);
      });
    });

    it('should return empty array for non-existent userId', async () => {
      const userId = 999;
      const response = await apiClient.getTodos({ userId });
      
      expect(response.status).toBe(200);
      expect(response.data).toEqual([]);
    });
  });

  describe('Data Integrity Tests', () => {
    it('should have consistent user IDs across todos', async () => {
      const response = await apiClient.getTodos();
      const userIds = [...new Set(response.data.map(todo => todo.userId))];
      
      // Should have users 1-10
      expect(userIds.length).toBe(10);
      expect(Math.min(...userIds)).toBe(1);
      expect(Math.max(...userIds)).toBe(10);
    });

    it('should have non-empty titles', async () => {
      const response = await apiClient.getTodos();
      
      response.data.forEach(todo => {
        expect(todo.title.trim()).toBeTruthy();
      });
    });

    it('should have balanced completed vs incomplete todos', async () => {
      const response = await apiClient.getTodos();
      const completedCount = response.data.filter(todo => todo.completed).length;
      const incompleteCount = response.data.filter(todo => !todo.completed).length;
      
      // Should have some completed and some incomplete todos
      expect(completedCount).toBeGreaterThan(0);
      expect(incompleteCount).toBeGreaterThan(0);
      expect(completedCount + incompleteCount).toBe(200);
    });

    it('should have todos distributed across all users', async () => {
      const response = await apiClient.getTodos();
      const todosPerUser = response.data.reduce((acc, todo) => {
        acc[todo.userId] = (acc[todo.userId] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);
      
      // Each user should have exactly 20 todos
      Object.values(todosPerUser).forEach(count => {
        expect(count).toBe(20);
      });
    });
  });

  describe('Relationship Tests', () => {
    it('should have todos with valid user relationships', async () => {
      const todosResponse = await apiClient.getTodos();
      const usersResponse = await apiClient.getUsers();
      
      const userIds = usersResponse.data.map(user => user.id);
      const todoUserIds = todosResponse.data.map(todo => todo.userId);
      
      // All todo user IDs should exist in users
      todoUserIds.forEach(todoUserId => {
        expect(userIds).toContain(todoUserId);
      });
    });

    it('should have consistent todo counts per user', async () => {
      // Test a sample of users instead of all 10 to avoid timeout
      const testUserIds = [1, 3, 5, 7, 10];
      
      for (const userId of testUserIds) {
        const userTodos = await apiClient.getTodos({ userId });
        expect(userTodos.data.length).toBe(20);
      }
    });
  });

  describe('Robustness Tests', () => {
    it('should handle invalid todo ID gracefully', async () => {
      await expect(apiClient.getTodo(-1)).rejects.toThrow();
    });

    it('should handle extremely large todo ID', async () => {
      await expect(apiClient.getTodo(Number.MAX_SAFE_INTEGER)).rejects.toThrow();
    });

    it('should handle invalid query parameters gracefully', async () => {
      // Test with invalid userId type
      const response = await apiClient.getTodos({ userId: 999 });
      expect(response.data).toEqual([]);
    });

    it('should handle multiple filter parameters correctly', async () => {
      const userId = 1;
      const completed = true;
      const response = await apiClient.getTodos({ userId, completed });
      
      expect(response.data.every(todo => 
        todo.userId === userId && todo.completed === completed
      )).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle first todo (ID 1)', async () => {
      const response = await apiClient.getTodo(1);
      expect(response.data.id).toBe(1);
      expect(response.data.userId).toBe(1);
    });

    it('should handle last todo (ID 200)', async () => {
      const response = await apiClient.getTodo(200);
      expect(response.data.id).toBe(200);
      expect(response.data.userId).toBe(10);
    });

    it('should handle middle todo (ID 100)', async () => {
      const response = await apiClient.getTodo(100);
      expect(response.data.id).toBe(100);
      expect(response.data.userId).toBe(5);
    });
  });
}); 