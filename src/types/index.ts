// Type definitions for JSONPlaceholder API
// These interfaces match the actual API response structure

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export interface Comment {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
}

export interface Album {
  userId: number;
  id: number;
  title: string;
}

export interface Photo {
  albumId: number;
  id: number;
  title: string;
  url: string;
  thumbnailUrl: string;
}

export interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

// User interface - includes nested address and company objects
export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string; // "business speak" - some companies use this
  };
}

// Request types for creating/updating posts
export interface CreatePostRequest {
  title: string;
  body: string;
  userId: number;
}

export interface UpdatePostRequest {
  title?: string;
  body?: string;
  userId?: number;
}

// Generic API response wrapper
// This helps standardize error handling across all endpoints
export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
} 