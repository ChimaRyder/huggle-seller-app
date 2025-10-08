import axios from 'axios';

interface Post {
    storeId: string,
    content: string,
    imageUrls: string[]
}

interface FullPost extends Post {
    id : string
}

const createPost = async (post : Post, token: string) => {
    console.log('=== PROMOTION CONTROLLER CREATE POST ===');
    console.log('Backend URL:', process.env.EXPO_PUBLIC_BACKEND_URL);
    console.log('Post data:', JSON.stringify(post, null, 2));
    console.log('Token exists:', !!token);

    const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/posts/`,
        post,
        {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: `Bearer ${token}`,
          },
        }
      )

    console.log('Create post response status:', response.status);
    console.log('Create post response data:', JSON.stringify(response.data, null, 2));
    return response;
}

const getAllPosts = async (token : string) => {
    const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/posts/my-posts`, {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: `Bearer ${token}`,
        }
    });

    return response;
}

const getPostbyID = async (postId : string, token : string) => {
    console.log('=== PROMOTION CONTROLLER GET POST BY ID ===');
    console.log('Backend URL:', process.env.EXPO_PUBLIC_BACKEND_URL);
    console.log('Post ID:', postId);
    console.log('Token exists:', !!token);
    console.log('Full URL:', `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/posts/${postId}`);

    const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/posts/${postId}`, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${token}`,
      }
    });

    console.log('Get post response status:', response.status);
    console.log('Get post response data:', JSON.stringify(response.data, null, 2));
    return response;
}

const updatePost = async (post : FullPost , token : string) => {
    const response = await axios
      .put(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/posts/${post.id}`,
        post,
        {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: `Bearer ${token}`,
          },
        }
      )

    return response;
}

const deletePost = async(postId : string, token : string) => {
    const response = await axios.delete(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/posts/${postId}`, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${token}`,
      }
    });

    return response;
}

export {createPost, getAllPosts, getPostbyID, updatePost, deletePost};