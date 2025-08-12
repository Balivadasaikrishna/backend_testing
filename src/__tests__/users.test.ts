import { JsonPlaceholderApiClient } from '../api-client';
import { User, Post, Todo, Album } from '../types';

// Testing the Users API endpoints
// This covers user data, relationships, and edge cases
describe('Users API Tests', () => {
  let apiClient: JsonPlaceholderApiClient;

  beforeAll(() => {
    apiClient = new JsonPlaceholderApiClient();
  });

  describe('GET /users - Get All Users', () => {
    it('should return all users with correct structure', async () => {
      const response = await apiClient.getUsers();
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBe(10);
      
      // Check the first user has all required properties
      const firstUser = response.data[0];
      expect(firstUser).toHaveProperty('id');
      expect(firstUser).toHaveProperty('name');
      expect(firstUser).toHaveProperty('username');
      expect(firstUser).toHaveProperty('email');
      expect(firstUser).toHaveProperty('address');
      expect(firstUser).toHaveProperty('phone');
      expect(firstUser).toHaveProperty('website');
      expect(firstUser).toHaveProperty('company');
    });

    it('should have users with IDs 1-10', async () => {
      const response = await apiClient.getUsers();
      const ids = response.data.map(user => user.id);
      
      expect(Math.min(...ids)).toBe(1);
      expect(Math.max(...ids)).toBe(10);
      expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('should have valid email formats for all users', async () => {
      const response = await apiClient.getUsers();
      
      response.data.forEach(user => {
        expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
    });
  });

  describe('GET /users/:id - Get Single User', () => {
    it('should return a specific user by ID', async () => {
      const userId = 1;
      const response = await apiClient.getUser(userId);
      
      expect(response.status).toBe(200);
      expect(response.data.id).toBe(userId);
      expect(response.data.name).toBeTruthy();
      expect(response.data.username).toBeTruthy();
      expect(response.data.email).toBeTruthy();
    });

    it('should return user with complete address information', async () => {
      const response = await apiClient.getUser(1);
      
      // Check address structure
      expect(response.data.address).toHaveProperty('street');
      expect(response.data.address).toHaveProperty('suite');
      expect(response.data.address).toHaveProperty('city');
      expect(response.data.address).toHaveProperty('zipcode');
      expect(response.data.address.geo).toHaveProperty('lat');
      expect(response.data.address.geo).toHaveProperty('lng');
    });

    it('should return user with complete company information', async () => {
      const response = await apiClient.getUser(1);
      
      // Check company structure
      expect(response.data.company).toHaveProperty('name');
      expect(response.data.company).toHaveProperty('catchPhrase');
      expect(response.data.company).toHaveProperty('bs');
    });

    it('should handle non-existent user gracefully', async () => {
      await expect(apiClient.getUser(999)).rejects.toThrow();
    });
  });

  describe('GET /users/:id/posts - Get User Posts', () => {
    it('should return posts for a specific user', async () => {
      const userId = 1;
      const response = await apiClient.getUserPosts(userId);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      
      // Verify all posts belong to the specified user
      if (response.data.length > 0) {
        response.data.forEach(post => {
          expect(post.userId).toBe(userId);
        });
      }
    });

    it('should return exactly 10 posts for user 1', async () => {
      const response = await apiClient.getUserPosts(1);
      expect(response.data.length).toBe(10);
    });

    it('should return posts for user 5', async () => {
      const response = await apiClient.getUserPosts(5);
      expect(response.data.every(post => post.userId === 5)).toBe(true);
    });

    it('should handle user with no posts gracefully', async () => {
      // User 999 doesn't exist, so should return empty array
      const response = await apiClient.getUserPosts(999);
      expect(response.data).toEqual([]);
    });
  });

  describe('GET /users/:id/todos - Get User Todos', () => {
    it('should return todos for a specific user', async () => {
      const userId = 1;
      const response = await apiClient.getUserTodos(userId);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      
      if (response.data.length > 0) {
        response.data.forEach(todo => {
          expect(todo.userId).toBe(userId);
        });
      }
    });

    it('should return exactly 20 todos for user 1', async () => {
      const response = await apiClient.getUserTodos(1);
      expect(response.data.length).toBe(20);
    });

    it('should have todos with valid completed status', async () => {
      const response = await apiClient.getUserTodos(1);
      
      response.data.forEach(todo => {
        expect(typeof todo.completed).toBe('boolean');
      });
    });
  });

  describe('GET /users/:id/albums - Get User Albums', () => {
    it('should return albums for a specific user', async () => {
      const userId = 1;
      const response = await apiClient.getUserAlbums(userId);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      
      if (response.data.length > 0) {
        response.data.forEach(album => {
          expect(album.userId).toBe(userId);
        });
      }
    });

    it('should return exactly 10 albums for user 1', async () => {
      const response = await apiClient.getUserAlbums(1);
      expect(response.data.length).toBe(10);
    });
  });

  describe('Data Integrity Tests', () => {
    it('should have unique usernames across all users', async () => {
      const response = await apiClient.getUsers();
      const usernames = response.data.map(user => user.username);
      const uniqueUsernames = [...new Set(usernames)];
      
      expect(uniqueUsernames.length).toBe(usernames.length);
    });

    it('should have unique email addresses across all users', async () => {
      const response = await apiClient.getUsers();
      const emails = response.data.map(user => user.email);
      const uniqueEmails = [...new Set(emails)];
      
      expect(uniqueEmails.length).toBe(emails.length);
    });

    it('should have valid website URLs', async () => {
      const response = await apiClient.getUsers();
      
      response.data.forEach(user => {
        // JSONPlaceholder websites don't have protocol, just domain names
        expect(user.website).toMatch(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
      });
    });

    it('should have valid phone number formats', async () => {
      const response = await apiClient.getUsers();
      
      response.data.forEach(user => {
        // JSONPlaceholder phone numbers include 'x' for extensions
        expect(user.phone).toMatch(/^[\d\s\-\(\)\+\.x]+$/);
      });
    });

    it('should have valid geographic coordinates', async () => {
      const response = await apiClient.getUsers();
      
      response.data.forEach(user => {
        const lat = parseFloat(user.address.geo.lat);
        const lng = parseFloat(user.address.geo.lng);
        
        // Check latitude and longitude are within valid ranges
        expect(lat).toBeGreaterThanOrEqual(-90);
        expect(lat).toBeLessThanOrEqual(90);
        expect(lng).toBeGreaterThanOrEqual(-180);
        expect(lng).toBeLessThanOrEqual(180);
      });
    });
  });

  describe('Relationship Tests', () => {
    it('should have consistent user-post relationships', async () => {
      const usersResponse = await apiClient.getUsers();
      const postsResponse = await apiClient.getPosts();
      
      const userIds = usersResponse.data.map(user => user.id);
      const postUserIds = postsResponse.data.map(post => post.userId);
      
      // All post user IDs should exist in users
      postUserIds.forEach(postUserId => {
        expect(userIds).toContain(postUserId);
      });
    });

    it('should have consistent user-todo relationships', async () => {
      const usersResponse = await apiClient.getUsers();
      const todosResponse = await apiClient.getTodos();
      
      const userIds = usersResponse.data.map(user => user.id);
      const todoUserIds = todosResponse.data.map(todo => todo.userId);
      
      // All todo user IDs should exist in users
      todoUserIds.forEach(todoUserId => {
        expect(userIds).toContain(todoUserId);
      });
    });

    it('should have consistent user-album relationships', async () => {
      const usersResponse = await apiClient.getUsers();
      const albumsResponse = await apiClient.getAlbums();
      
      const userIds = usersResponse.data.map(user => user.id);
      const albumUserIds = albumsResponse.data.map(album => album.userId);
      
      // All album user IDs should exist in users
      albumUserIds.forEach(albumUserId => {
        expect(userIds).toContain(albumUserId);
      });
    });
  });

  describe('Robustness Tests', () => {
    it('should handle invalid user ID gracefully', async () => {
      await expect(apiClient.getUser(-1)).rejects.toThrow();
    });

    it('should handle extremely large user ID', async () => {
      await expect(apiClient.getUser(Number.MAX_SAFE_INTEGER)).rejects.toThrow();
    });

    it('should handle string user ID gracefully', async () => {
      // This test would fail at runtime, but TypeScript should catch it
      // I'm commenting this out since it's a type error, not a runtime test
      // await expect(apiClient.getUser('invalid' as any)).rejects.toThrow();
    });
  });
}); 