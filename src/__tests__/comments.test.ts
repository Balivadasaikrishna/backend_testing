import { JsonPlaceholderApiClient } from '../api-client';
import { Comment } from '../types';

describe('Comments API Tests', () => {
  let apiClient: JsonPlaceholderApiClient;

  beforeAll(() => {
    apiClient = new JsonPlaceholderApiClient();
  });

  describe('GET /comments - Get All Comments', () => {
    it('should return all comments with correct structure', async () => {
      const response = await apiClient.getComments();
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBe(500);
      
      // Verify first comment structure
      const firstComment = response.data[0];
      expect(firstComment).toHaveProperty('id');
      expect(firstComment).toHaveProperty('name');
      expect(firstComment).toHaveProperty('email');
      expect(firstComment).toHaveProperty('body');
      expect(firstComment).toHaveProperty('postId');
      expect(typeof firstComment.id).toBe('number');
      expect(typeof firstComment.name).toBe('string');
      expect(typeof firstComment.email).toBe('string');
      expect(typeof firstComment.body).toBe('string');
      expect(typeof firstComment.postId).toBe('number');
    });

    it('should have comments with IDs 1-500', async () => {
      const response = await apiClient.getComments();
      const ids = response.data.map(comment => comment.id);
      
      expect(Math.min(...ids)).toBe(1);
      expect(Math.max(...ids)).toBe(500);
    });

    it('should have valid email formats for all comments', async () => {
      const response = await apiClient.getComments();
      
      response.data.forEach(comment => {
        expect(comment.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
    });
  });

  describe('GET /comments with Query Parameters', () => {
    it('should filter comments by postId', async () => {
      const postId = 1;
      const response = await apiClient.getComments({ postId });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBe(5);
      
      response.data.forEach(comment => {
        expect(comment.postId).toBe(postId);
      });
    });

    it('should return exactly 5 comments for post 1', async () => {
      const response = await apiClient.getComments({ postId: 1 });
      expect(response.data.length).toBe(5);
    });

    it('should return exactly 5 comments for post 10', async () => {
      const response = await apiClient.getComments({ postId: 10 });
      expect(response.data.length).toBe(5);
    });

    it('should return empty array for non-existent postId', async () => {
      const postId = 999;
      const response = await apiClient.getComments({ postId });
      
      expect(response.status).toBe(200);
      expect(response.data).toEqual([]);
    });
  });

  describe('GET /comments/:id - Get Single Comment', () => {
    it('should return a specific comment by ID', async () => {
      const commentId = 1;
      const response = await apiClient.getComment(commentId);
      
      expect(response.status).toBe(200);
      expect(response.data.id).toBe(commentId);
      expect(response.data.name).toBeTruthy();
      expect(response.data.email).toBeTruthy();
      expect(response.data.body).toBeTruthy();
      expect(response.data.postId).toBeGreaterThan(0);
    });

    it('should return comment with ID 250', async () => {
      const response = await apiClient.getComment(250);
      expect(response.data.id).toBe(250);
    });

    it('should return comment with ID 500', async () => {
      const response = await apiClient.getComment(500);
      expect(response.data.id).toBe(500);
    });

    it('should handle non-existent comment gracefully', async () => {
      await expect(apiClient.getComment(999)).rejects.toThrow();
    });
  });

  describe('Data Integrity Tests', () => {
    it('should have consistent post IDs across comments', async () => {
      const response = await apiClient.getComments();
      const postIds = [...new Set(response.data.map(comment => comment.postId))];
      
      // Should have posts 1-100
      expect(postIds.length).toBe(100);
      expect(Math.min(...postIds)).toBe(1);
      expect(Math.max(...postIds)).toBe(100);
    });

    it('should have non-empty names, emails, and bodies', async () => {
      const response = await apiClient.getComments();
      
      response.data.forEach(comment => {
        expect(comment.name.trim()).toBeTruthy();
        expect(comment.email.trim()).toBeTruthy();
        expect(comment.body.trim()).toBeTruthy();
      });
    });

    it('should have comments distributed across all posts', async () => {
      const response = await apiClient.getComments();
      const commentsPerPost = response.data.reduce((acc, comment) => {
        acc[comment.postId] = (acc[comment.postId] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);
      
      // Each post should have exactly 5 comments
      Object.values(commentsPerPost).forEach(count => {
        expect(count).toBe(5);
      });
    });

    it('should have unique comment IDs', async () => {
      const response = await apiClient.getComments();
      const commentIds = response.data.map(comment => comment.id);
      const uniqueCommentIds = [...new Set(commentIds)];
      
      expect(uniqueCommentIds.length).toBe(commentIds.length);
    });
  });

  describe('Relationship Tests', () => {
    it('should have comments with valid post relationships', async () => {
      const commentsResponse = await apiClient.getComments();
      const postsResponse = await apiClient.getPosts();
      
      const postIds = postsResponse.data.map(post => post.id);
      const commentPostIds = commentsResponse.data.map(comment => comment.postId);
      
      // All comment post IDs should exist in posts
      commentPostIds.forEach(commentPostId => {
        expect(postIds).toContain(commentPostId);
      });
    });

    it('should have consistent comment counts per post', async () => {
      // Test a sample of posts instead of all 100 to avoid timeout
      const testPostIds = [1, 25, 50, 75, 100];
      
      for (const postId of testPostIds) {
        const postComments = await apiClient.getPostComments(postId);
        expect(postComments.data.length).toBe(5);
      }
    });

    it('should have consistent comment counts when filtering by postId', async () => {
      // Test a sample of posts instead of all 100 to avoid timeout
      const testPostIds = [1, 25, 50, 75, 100];
      
      for (const postId of testPostIds) {
        const filteredComments = await apiClient.getComments({ postId });
        const postComments = await apiClient.getPostComments(postId);
        
        expect(filteredComments.data.length).toBe(postComments.data.length);
        expect(filteredComments.data.length).toBe(5);
      }
    });
  });

  describe('Robustness Tests', () => {
    it('should handle invalid comment ID gracefully', async () => {
      await expect(apiClient.getComment(-1)).rejects.toThrow();
    });

    it('should handle extremely large comment ID', async () => {
      await expect(apiClient.getComment(Number.MAX_SAFE_INTEGER)).rejects.toThrow();
    });

    it('should handle invalid query parameters gracefully', async () => {
      // Test with invalid postId type
      const response = await apiClient.getComments({ postId: 999 });
      expect(response.data).toEqual([]);
    });

    it('should handle network timeout gracefully', async () => {
      const timeoutClient = new JsonPlaceholderApiClient('https://httpbin.org/delay/15', 5000);
      await expect(timeoutClient.getComments()).rejects.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle first comment (ID 1)', async () => {
      const response = await apiClient.getComment(1);
      expect(response.data.id).toBe(1);
      expect(response.data.postId).toBe(1);
    });

    it('should handle last comment (ID 500)', async () => {
      const response = await apiClient.getComment(500);
      expect(response.data.id).toBe(500);
      expect(response.data.postId).toBe(100);
    });

    it('should handle middle comment (ID 250)', async () => {
      const response = await apiClient.getComment(250);
      expect(response.data.id).toBe(250);
      expect(response.data.postId).toBe(50);
    });

    it('should handle comments for first post (ID 1)', async () => {
      const response = await apiClient.getComments({ postId: 1 });
      expect(response.data.length).toBe(5);
      response.data.forEach(comment => {
        expect(comment.postId).toBe(1);
      });
    });

    it('should handle comments for last post (ID 100)', async () => {
      const response = await apiClient.getComments({ postId: 100 });
      expect(response.data.length).toBe(5);
      response.data.forEach(comment => {
        expect(comment.postId).toBe(100);
      });
    });
  });

  describe('Email Validation Tests', () => {
    it('should have valid email formats for all comments', async () => {
      const response = await apiClient.getComments();
      
      response.data.forEach(comment => {
        // Basic email format validation
        expect(comment.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
        
        // Should have @ symbol
        expect(comment.email).toContain('@');
        
        // Should have domain extension
        expect(comment.email.split('@')[1]).toContain('.');
      });
    });

    it('should have diverse email domains', async () => {
      const response = await apiClient.getComments();
      const domains = [...new Set(response.data.map(comment => 
        comment.email.split('@')[1]
      ))];
      
      // Should have multiple different domains
      expect(domains.length).toBeGreaterThan(1);
    });
  });

  describe('Content Validation Tests', () => {
    it('should have meaningful comment names', async () => {
      const response = await apiClient.getComments();
      
      response.data.forEach(comment => {
        expect(comment.name.length).toBeGreaterThan(0);
        expect(comment.name.trim()).toBeTruthy();
      });
    });

    it('should have meaningful comment bodies', async () => {
      const response = await apiClient.getComments();
      
      response.data.forEach(comment => {
        expect(comment.body.length).toBeGreaterThan(0);
        expect(comment.body.trim()).toBeTruthy();
      });
    });

    it('should have reasonable comment body lengths', async () => {
      const response = await apiClient.getComments();
      
      response.data.forEach(comment => {
        // Comments should have reasonable length (not too short, not too long)
        expect(comment.body.length).toBeGreaterThan(10);
        expect(comment.body.length).toBeLessThan(1000);
      });
    });
  });
}); 