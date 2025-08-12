import { JsonPlaceholderApiClient } from '../api-client';
import { Album, Photo } from '../types';

describe('Albums and Photos API Tests', () => {
  let apiClient: JsonPlaceholderApiClient;

  beforeAll(() => {
    apiClient = new JsonPlaceholderApiClient();
  });

  describe('GET /albums - Get All Albums', () => {
    it('should return all albums with correct structure', async () => {
      const response = await apiClient.getAlbums();
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBe(100);
      
      // Verify first album structure
      const firstAlbum = response.data[0];
      expect(firstAlbum).toHaveProperty('id');
      expect(firstAlbum).toHaveProperty('title');
      expect(firstAlbum).toHaveProperty('userId');
      expect(typeof firstAlbum.id).toBe('number');
      expect(typeof firstAlbum.title).toBe('string');
      expect(typeof firstAlbum.userId).toBe('number');
    });

    it('should have albums with IDs 1-100', async () => {
      const response = await apiClient.getAlbums();
      const ids = response.data.map(album => album.id);
      
      expect(Math.min(...ids)).toBe(1);
      expect(Math.max(...ids)).toBe(100);
    });

    it('should have non-empty titles', async () => {
      const response = await apiClient.getAlbums();
      
      response.data.forEach(album => {
        expect(album.title.trim()).toBeTruthy();
      });
    });
  });

  describe('GET /albums/:id - Get Single Album', () => {
    it('should return a specific album by ID', async () => {
      const albumId = 1;
      const response = await apiClient.getAlbum(albumId);
      
      expect(response.status).toBe(200);
      expect(response.data.id).toBe(albumId);
      expect(response.data.title).toBeTruthy();
      expect(response.data.userId).toBeGreaterThan(0);
    });

    it('should return album with ID 50', async () => {
      const response = await apiClient.getAlbum(50);
      expect(response.data.id).toBe(50);
    });

    it('should return album with ID 100', async () => {
      const response = await apiClient.getAlbum(100);
      expect(response.data.id).toBe(100);
    });

    it('should handle non-existent album gracefully', async () => {
      await expect(apiClient.getAlbum(999)).rejects.toThrow();
    });
  });

  describe('GET /albums/:id/photos - Get Album Photos', () => {
    it('should return photos for a specific album', async () => {
      const albumId = 1;
      const response = await apiClient.getAlbumPhotos(albumId);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBe(50);
      
      if (response.data.length > 0) {
        response.data.forEach(photo => {
          expect(photo.albumId).toBe(albumId);
        });
      }
    });

    it('should return exactly 50 photos for album 1', async () => {
      const response = await apiClient.getAlbumPhotos(1);
      expect(response.data.length).toBe(50);
    });

    it('should return photos for album 5', async () => {
      const response = await apiClient.getAlbumPhotos(5);
      expect(response.data.every(photo => photo.albumId === 5)).toBe(true);
    });
  });

  describe('GET /photos - Get All Photos', () => {
    it('should return all photos with correct structure', async () => {
      const response = await apiClient.getPhotos();
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBe(5000);
      
      // Verify first photo structure
      const firstPhoto = response.data[0];
      expect(firstPhoto).toHaveProperty('id');
      expect(firstPhoto).toHaveProperty('title');
      expect(firstPhoto).toHaveProperty('url');
      expect(firstPhoto).toHaveProperty('thumbnailUrl');
      expect(firstPhoto).toHaveProperty('albumId');
      expect(typeof firstPhoto.id).toBe('number');
      expect(typeof firstPhoto.title).toBe('string');
      expect(typeof firstPhoto.url).toBe('string');
      expect(typeof firstPhoto.thumbnailUrl).toBe('string');
      expect(typeof firstPhoto.albumId).toBe('number');
    });

    it('should have photos with IDs 1-5000', async () => {
      const response = await apiClient.getPhotos();
      const ids = response.data.map(photo => photo.id);
      
      expect(Math.min(...ids)).toBe(1);
      expect(Math.max(...ids)).toBe(5000);
    });
  });

  describe('GET /photos with Query Parameters', () => {
    it('should filter photos by albumId', async () => {
      const albumId = 1;
      const response = await apiClient.getPhotos({ albumId });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBe(50);
      
      response.data.forEach(photo => {
        expect(photo.albumId).toBe(albumId);
      });
    });

    it('should return empty array for non-existent albumId', async () => {
      const albumId = 999;
      const response = await apiClient.getPhotos({ albumId });
      
      expect(response.status).toBe(200);
      expect(response.data).toEqual([]);
    });
  });

  describe('GET /photos/:id - Get Single Photo', () => {
    it('should return a specific photo by ID', async () => {
      const photoId = 1;
      const response = await apiClient.getPhoto(photoId);
      
      expect(response.status).toBe(200);
      expect(response.data.id).toBe(photoId);
      expect(response.data.title).toBeTruthy();
      expect(response.data.url).toBeTruthy();
      expect(response.data.thumbnailUrl).toBeTruthy();
      expect(response.data.albumId).toBeGreaterThan(0);
    });

    it('should return photo with ID 2500', async () => {
      const response = await apiClient.getPhoto(2500);
      expect(response.data.id).toBe(2500);
    });

    it('should return photo with ID 5000', async () => {
      const response = await apiClient.getPhoto(5000);
      expect(response.data.id).toBe(5000);
    });

    it('should handle non-existent photo gracefully', async () => {
      await expect(apiClient.getPhoto(9999)).rejects.toThrow();
    });
  });

  describe('Data Integrity Tests', () => {
    it('should have consistent user IDs across albums', async () => {
      const response = await apiClient.getAlbums();
      const userIds = [...new Set(response.data.map(album => album.userId))];
      
      // Should have users 1-10
      expect(userIds.length).toBe(10);
      expect(Math.min(...userIds)).toBe(1);
      expect(Math.max(...userIds)).toBe(10);
    });

    it('should have consistent album IDs across photos', async () => {
      const response = await apiClient.getPhotos();
      const albumIds = [...new Set(response.data.map(photo => photo.albumId))];
      
      // Should have albums 1-100
      expect(albumIds.length).toBe(100);
      expect(Math.min(...albumIds)).toBe(1);
      expect(Math.max(...albumIds)).toBe(100);
    });

    it('should have valid URLs for all photos', async () => {
      const response = await apiClient.getPhotos();
      
      response.data.forEach(photo => {
        expect(photo.url).toMatch(/^https?:\/\/.+/);
        expect(photo.thumbnailUrl).toMatch(/^https?:\/\/.+/);
      });
    });

    it('should have non-empty titles for all photos', async () => {
      const response = await apiClient.getPhotos();
      
      response.data.forEach(photo => {
        expect(photo.title.trim()).toBeTruthy();
      });
    });

    it('should have albums distributed across all users', async () => {
      const response = await apiClient.getAlbums();
      const albumsPerUser = response.data.reduce((acc, album) => {
        acc[album.userId] = (acc[album.userId] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);
      
      // Each user should have exactly 10 albums
      Object.values(albumsPerUser).forEach(count => {
        expect(count).toBe(10);
      });
    });

    it('should have photos distributed across all albums', async () => {
      const response = await apiClient.getPhotos();
      const photosPerAlbum = response.data.reduce((acc, photo) => {
        acc[photo.albumId] = (acc[photo.albumId] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);
      
      // Each album should have exactly 50 photos
      Object.values(photosPerAlbum).forEach(count => {
        expect(count).toBe(50);
      });
    });
  });

  describe('Relationship Tests', () => {
    it('should have albums with valid user relationships', async () => {
      const albumsResponse = await apiClient.getAlbums();
      const usersResponse = await apiClient.getUsers();
      
      const userIds = usersResponse.data.map(user => user.id);
      const albumUserIds = albumsResponse.data.map(album => album.userId);
      
      // All album user IDs should exist in users
      albumUserIds.forEach(albumUserId => {
        expect(userIds).toContain(albumUserId);
      });
    });

    it('should have photos with valid album relationships', async () => {
      const photosResponse = await apiClient.getPhotos();
      const albumsResponse = await apiClient.getAlbums();
      
      const albumIds = albumsResponse.data.map(album => album.id);
      const photoAlbumIds = photosResponse.data.map(photo => photo.albumId);
      
      // All photo album IDs should exist in albums
      photoAlbumIds.forEach(photoAlbumId => {
        expect(albumIds).toContain(photoAlbumId);
      });
    });

    it('should have consistent photo counts per album', async () => {
      // Test a sample of albums instead of all 100 to avoid timeout
      const testAlbumIds = [1, 25, 50, 75, 100];
      
      for (const albumId of testAlbumIds) {
        const albumPhotos = await apiClient.getAlbumPhotos(albumId);
        expect(albumPhotos.data.length).toBe(50);
      }
    });

    it('should have consistent album counts per user', async () => {
      const usersResponse = await apiClient.getUsers();
      
      for (const user of usersResponse.data) {
        const userAlbums = await apiClient.getUserAlbums(user.id);
        expect(userAlbums.data.length).toBe(10);
      }
    });
  });

  describe('Robustness Tests', () => {
    it('should handle invalid album ID gracefully', async () => {
      await expect(apiClient.getAlbum(-1)).rejects.toThrow();
    });

    it('should handle invalid photo ID gracefully', async () => {
      await expect(apiClient.getPhoto(-1)).rejects.toThrow();
    });

    it('should handle extremely large IDs gracefully', async () => {
      await expect(apiClient.getAlbum(Number.MAX_SAFE_INTEGER)).rejects.toThrow();
      await expect(apiClient.getPhoto(Number.MAX_SAFE_INTEGER)).rejects.toThrow();
    });

    it('should handle network timeout gracefully', async () => {
      const timeoutClient = new JsonPlaceholderApiClient('https://httpbin.org/delay/15', 5000);
      await expect(timeoutClient.getAlbums()).rejects.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle first album (ID 1)', async () => {
      const response = await apiClient.getAlbum(1);
      expect(response.data.id).toBe(1);
      expect(response.data.userId).toBe(1);
    });

    it('should handle last album (ID 100)', async () => {
      const response = await apiClient.getAlbum(100);
      expect(response.data.id).toBe(100);
      expect(response.data.userId).toBe(10);
    });

    it('should handle first photo (ID 1)', async () => {
      const response = await apiClient.getPhoto(1);
      expect(response.data.id).toBe(1);
      expect(response.data.albumId).toBe(1);
    });

    it('should handle last photo (ID 5000)', async () => {
      const response = await apiClient.getPhoto(5000);
      expect(response.data.id).toBe(5000);
      expect(response.data.albumId).toBe(100);
    });
  });
}); 