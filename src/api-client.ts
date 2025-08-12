import axios from 'axios';
import {
  Post,
  Comment,
  Album,
  Photo,
  Todo,
  User,
  CreatePostRequest,
  UpdatePostRequest,
  ApiResponse
} from './types';

// Main client for JSONPlaceholder API - handles all the CRUD operations
// I'm using axios here because it's reliable and handles timeouts well
// Could probably use fetch() instead but axios has better error handling
export class JsonPlaceholderApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = 'https://jsonplaceholder.typicode.com', timeout: number = 10000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  // Generic request method - handles all HTTP methods
  // This reduces code duplication but sometimes makes debugging harder
  // TODO: maybe add retry logic for failed requests
  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    data?: any,
    params?: any
  ): Promise<ApiResponse<T>> {
    try {
      // Build config object - spreading data/params only if they exist
      const config = {
        method,
        url: `${this.baseUrl}${endpoint}`,
        timeout: this.timeout,
        ...(data && { data }),
        ...(params && { params })
      };

      const response = await axios(config);
      
      return {
        data: response.data as T,
        status: response.status,
        statusText: response.statusText
      };
    } catch (error: any) {
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        throw new Error(`API request failed: ${error.message} - Status: ${error.response.status}`);
      } else if (error.code === 'ECONNABORTED') {
        // Timeout error
        throw new Error(`Request timed out after ${this.timeout}ms`);
      } else {
        // Network or other unexpected error
        throw new Error(`Unexpected error: ${error}`);
      }
    }
  }

  // ===== POSTS ENDPOINTS =====
  // These handle all post-related operations
  
  async getPosts(): Promise<ApiResponse<Post[]>> {
    return this.makeRequest<Post[]>('GET', '/posts');
  }

  async getPost(id: number): Promise<ApiResponse<Post>> {
    if (id <= 0) {
      throw new Error('Post ID must be positive');
    }
    return this.makeRequest<Post>('GET', `/posts/${id}`);
  }

  async getPostComments(postId: number): Promise<ApiResponse<Comment[]>> {
    return this.makeRequest<Comment[]>('GET', `/posts/${postId}/comments`);
  }

  async createPost(postData: CreatePostRequest): Promise<ApiResponse<Post>> {
    // Basic validation - could be more thorough
    if (!postData.title || !postData.body) {
      throw new Error('Title and body are required');
    }
    return this.makeRequest<Post>('POST', '/posts', postData);
  }

  async updatePost(id: number, postData: UpdatePostRequest): Promise<ApiResponse<Post>> {
    return this.makeRequest<Post>('PUT', `/posts/${id}`, postData);
  }

  async patchPost(id: number, postData: Partial<UpdatePostRequest>): Promise<ApiResponse<Post>> {
    // PATCH is useful for partial updates
    return this.makeRequest<Post>('PATCH', `/posts/${id}`, postData);
  }

  async deletePost(id: number): Promise<ApiResponse<{}>> {
    return this.makeRequest<{}>('DELETE', `/posts/${id}`);
  }

  // ===== COMMENTS ENDPOINTS =====
  
  async getComments(params?: { postId?: number }): Promise<ApiResponse<Comment[]>> {
    return this.makeRequest<Comment[]>('GET', '/comments', undefined, params);
  }

  async getComment(id: number): Promise<ApiResponse<Comment>> {
    return this.makeRequest<Comment>('GET', `/comments/${id}`);
  }

  // ===== ALBUMS ENDPOINTS =====
  
  async getAlbums(): Promise<ApiResponse<Album[]>> {
    return this.makeRequest<Album[]>('GET', '/albums');
  }

  async getAlbum(id: number): Promise<ApiResponse<Album>> {
    return this.makeRequest<Album>('GET', `/albums/${id}`);
  }

  async getAlbumPhotos(albumId: number): Promise<ApiResponse<Photo[]>> {
    return this.makeRequest<Photo[]>('GET', `/albums/${albumId}/photos`);
  }

  // ===== PHOTOS ENDPOINTS =====
  
  async getPhotos(params?: { albumId?: number }): Promise<ApiResponse<Photo[]>> {
    return this.makeRequest<Photo[]>('GET', '/photos', undefined, params);
  }

  async getPhoto(id: number): Promise<ApiResponse<Photo>> {
    return this.makeRequest<Photo>('GET', `/photos/${id}`);
  }

  // ===== TODOS ENDPOINTS =====
  
  async getTodos(params?: { userId?: number; completed?: boolean }): Promise<ApiResponse<Todo[]>> {
    return this.makeRequest<Todo[]>('GET', '/todos', undefined, params);
  }

  async getTodo(id: number): Promise<ApiResponse<Todo>> {
    return this.makeRequest<Todo>('GET', `/todos/${id}`);
  }

  // ===== USERS ENDPOINTS =====
  
  async getUsers(): Promise<ApiResponse<User[]>> {
    return this.makeRequest<User[]>('GET', '/users');
  }

  async getUser(id: number): Promise<ApiResponse<User>> {
    return this.makeRequest<User>('GET', `/users/${id}`);
  }

  // Get posts for a specific user
  async getUserPosts(userId: number): Promise<ApiResponse<Post[]>> {
    return this.makeRequest<Post[]>('GET', `/users/${userId}/posts`);
  }

  // Get todos for a specific user
  async getUserTodos(userId: number): Promise<ApiResponse<Todo[]>> {
    return this.makeRequest<Todo[]>('GET', `/users/${userId}/todos`);
  }

  // Get albums for a specific user
  async getUserAlbums(userId: number): Promise<ApiResponse<Album[]>> {
    return this.makeRequest<Album[]>('GET', `/users/${userId}/albums`);
  }
} 