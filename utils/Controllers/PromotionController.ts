import axios from 'axios';

interface Post {
    storeId: string,
    content: string,
    imageUrls: string[]
}

interface FullPost extends Post {
    id : number
}

const createPost = async (post : Post, token: string) => {

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

    return response;
}

const getAllPosts = async (id : string, token : string) => {
    const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/posts/search?StoreId=${id}`, {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: `Bearer ${token}`,
        }
    });

    return response;
}

const getPostbyID = async (postId : string, token : string) => {
    const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/posts/${postId}`, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${token}`,
      }
    });

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

const deletePost = async(postId : number, token : string) => {
    const response = await axios.delete(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/posts/${postId}`, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${token}`,
      }
    });

    return response;
}

export {createPost, getAllPosts, getPostbyID, updatePost, deletePost};