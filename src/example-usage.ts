import { JsonPlaceholderApiClient } from './api-client';

// Example usage of the JSONPlaceholder API client
// This shows how to use the different endpoints

async function main() {
  // Create a new client instance
  const apiClient = new JsonPlaceholderApiClient();
  
  try {
    // Get all posts
    const postsResponse = await apiClient.getPosts();
    
    // Get a specific post
    const postResponse = await apiClient.getPost(1);
    
    // Get comments for a post
    const commentsResponse = await apiClient.getPostComments(1);
    
    // Get all users
    const usersResponse = await apiClient.getUsers();
    
    // Get todos for a specific user
    const todosResponse = await apiClient.getTodos({ userId: 1 });
    
    // Get albums and photos
    const albumsResponse = await apiClient.getAlbums();
    
    // Create a new post (this won't actually persist on JSONPlaceholder)
    const newPost = {
      title: 'My Test Post',
      body: 'This is a test post created by the API client.',
      userId: 1
    };
    
    const createResponse = await apiClient.createPost(newPost);
    
    // All operations completed successfully
    return {
      postsCount: postsResponse.data.length,
      postTitle: postResponse.data.title,
      commentsCount: commentsResponse.data.length,
      usersCount: usersResponse.data.length,
      todosCount: todosResponse.data.length,
      albumsCount: albumsResponse.data.length,
      createdPostId: createResponse.data.id
    };
    
  } catch (error) {
    throw new Error(`Example usage failed: ${error}`);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`Error: ${error}\n`);
    process.exit(1);
  });
}

export { main }; 