import { JsonPlaceholderApiClient } from '../api-client';
import { Post, CreatePostRequest, UpdatePostRequest } from '../types';

// Test suite for Posts API endpoints
// I'm testing both happy path and edge cases here
describe('Posts API Tests', () => {
  let apiClient: JsonPlaceholderApiClient;

  beforeAll(() => {
    apiClient = new JsonPlaceholderApiClient();
  });

  describe('GET /posts - Get All Posts', () => {
    it('should return all posts with correct structure', async () => {
      const response = await apiClient.getPosts();
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
      
      // Check the first post has all required fields
      const firstPost = response.data[0];
      expect(firstPost).toHaveProperty('id');
      expect(firstPost).toHaveProperty('title');
      expect(firstPost).toHaveProperty('body');
      expect(firstPost).toHaveProperty('userId');
      
      // Verify data types
      expect(typeof firstPost.id).toBe('number');
      expect(typeof firstPost.title).toBe('string');
      expect(typeof firstPost.body).toBe('string');
      expect(typeof firstPost.userId).toBe('number');
    });

    it('should return exactly 100 posts', async () => {
      const response = await apiClient.getPosts();
      expect(response.data.length).toBe(100);
    });

    it('should have posts with valid IDs (1-100)', async () => {
      const response = await apiClient.getPosts();
      const ids = response.data.map(post => post.id);
      
      // Check min/max and some specific values
      expect(Math.min(...ids)).toBe(1);
      expect(Math.max(...ids)).toBe(100);
      expect(ids).toEqual(expect.arrayContaining([1, 50, 100]));
    });
  });

  describe('GET /posts/:id - Get Single Post', () => {
    it('should return a specific post by ID', async () => {
      const postId = 1;
      const response = await apiClient.getPost(postId);
      
      expect(response.status).toBe(200);
      expect(response.data.id).toBe(postId);
      expect(response.data.title).toBeTruthy();
      expect(response.data.body).toBeTruthy();
      expect(response.data.userId).toBeGreaterThan(0);
    });

    it('should return post with ID 50', async () => {
      const response = await apiClient.getPost(50);
      expect(response.data.id).toBe(50);
    });

    it('should return post with ID 100', async () => {
      const response = await apiClient.getPost(100);
      expect(response.data.id).toBe(100);
    });

    it('should handle non-existent post gracefully', async () => {
      // This should throw an error for non-existent posts
      await expect(apiClient.getPost(999)).rejects.toThrow();
    });
  });

  describe('GET /posts/:id/comments - Get Post Comments', () => {
    it('should return comments for a specific post', async () => {
      const postId = 1;
      const response = await apiClient.getPostComments(postId);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      
      // Check comment structure if we have any
      if (response.data.length > 0) {
        const comment = response.data[0];
        expect(comment.postId).toBe(postId);
        expect(comment).toHaveProperty('id');
        expect(comment).toHaveProperty('name');
        expect(comment).toHaveProperty('email');
        expect(comment).toHaveProperty('body');
      }
    });

    it('should return comments for post ID 5', async () => {
      const response = await apiClient.getPostComments(5);
      // All comments should belong to post 5
      expect(response.data.every(comment => comment.postId === 5)).toBe(true);
    });
  });

  describe('POST /posts - Create Post', () => {
    it('should create a new post successfully', async () => {
      const newPost: CreatePostRequest = {
        title: 'Test Post Title',
        body: 'This is a test post body content.',
        userId: 1
      };

      const response = await apiClient.createPost(newPost);
      
      expect(response.status).toBe(201);
      expect(response.data.title).toBe(newPost.title);
      expect(response.data.body).toBe(newPost.body);
      expect(response.data.userId).toBe(newPost.userId);
      // JSONPlaceholder returns the next available ID (101)
      expect(response.data.id).toBe(101);
    });

    it('should create post with empty title and body', async () => {
      const newPost: CreatePostRequest = {
        title: '',
        body: '',
        userId: 1
      };

      // This should now fail due to validation
      await expect(apiClient.createPost(newPost)).rejects.toThrow('Title and body are required');
    });

    it('should create post with very long content', async () => {
      // Test with extremely long strings
      const longTitle = 'A'.repeat(1000);
      const longBody = 'B'.repeat(5000);
      
      const newPost: CreatePostRequest = {
        title: longTitle,
        body: longBody,
        userId: 1
      };

      const response = await apiClient.createPost(newPost);
      expect(response.status).toBe(201);
      expect(response.data.title).toBe(longTitle);
      expect(response.data.body).toBe(longBody);
    });
  });

  describe('PUT /posts/:id - Update Post', () => {
    it('should update an existing post completely', async () => {
      const postId = 1;
      const updateData: UpdatePostRequest = {
        title: 'Updated Title',
        body: 'Updated body content',
        userId: 5
      };

      const response = await apiClient.updatePost(postId, updateData);
      
      expect(response.status).toBe(200);
      expect(response.data.id).toBe(postId);
      expect(response.data.title).toBe(updateData.title);
      expect(response.data.body).toBe(updateData.body);
      expect(response.data.userId).toBe(updateData.userId);
    });

    it('should update only title field', async () => {
      const postId = 2;
      const updateData: UpdatePostRequest = {
        title: 'Only Title Updated'
      };

      const response = await apiClient.updatePost(postId, updateData);
      expect(response.status).toBe(200);
      expect(response.data.title).toBe(updateData.title);
    });
  });

  describe('PATCH /posts/:id - Partial Update Post', () => {
    it('should partially update a post', async () => {
      const postId = 3;
      const patchData = {
        title: 'Patched Title'
      };

      const response = await apiClient.patchPost(postId, patchData);
      
      expect(response.status).toBe(200);
      expect(response.data.id).toBe(postId);
      expect(response.data.title).toBe(patchData.title);
    });

    it('should handle empty patch data', async () => {
      const postId = 4;
      const patchData = {};

      const response = await apiClient.patchPost(postId, patchData);
      expect(response.status).toBe(200);
      expect(response.data.id).toBe(postId);
    });
  });

  describe('DELETE /posts/:id - Delete Post', () => {
    it('should delete a post successfully', async () => {
      const postId = 1;
      const response = await apiClient.deletePost(postId);
      
      expect(response.status).toBe(200);
      expect(response.data).toEqual({});
    });

    it('should handle deletion of non-existent post', async () => {
      // JSONPlaceholder doesn't actually delete, just returns success
      const response = await apiClient.deletePost(999);
      expect(response.status).toBe(200);
    });
  });

  describe('Data Integrity Tests', () => {
    it('should have consistent user IDs across posts', async () => {
      const response = await apiClient.getPosts();
      const userIds = [...new Set(response.data.map(post => post.userId))];
      
      // Should have users 1-10 (based on the mock data)
      expect(userIds.length).toBe(10);
      expect(Math.min(...userIds)).toBe(1);
      expect(Math.max(...userIds)).toBe(10);
    });

    it('should have non-empty titles and bodies', async () => {
      const response = await apiClient.getPosts();
      
      response.data.forEach(post => {
        expect(post.title.trim()).toBeTruthy();
        expect(post.body.trim()).toBeTruthy();
      });
    });

    it('should have valid email format in post comments', async () => {
      const response = await apiClient.getPostComments(1);
      
      // Basic email validation regex
      response.data.forEach(comment => {
        expect(comment.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
    });
  });

  describe('Robustness Tests', () => {
    it('should handle invalid post ID gracefully', async () => {
      // Test with negative ID
      await expect(apiClient.getPost(-1)).rejects.toThrow();
    });

    it('should handle extremely large post ID', async () => {
      // Test with max safe integer
      await expect(apiClient.getPost(Number.MAX_SAFE_INTEGER)).rejects.toThrow();
    });

    it('should handle malformed post data in creation', async () => {
      const malformedPost = {
        title: null,
        body: undefined,
        userId: 'invalid'
      } as any;

      // This should now fail due to validation
      await expect(apiClient.createPost(malformedPost)).rejects.toThrow('Title and body are required');
    });

    it('should handle network timeout gracefully', async () => {
      // Test with a slow endpoint and short timeout
      const timeoutClient = new JsonPlaceholderApiClient('https://httpbin.org/delay/15', 5000);
      await expect(timeoutClient.getPosts()).rejects.toThrow();
    });
  });
}); 