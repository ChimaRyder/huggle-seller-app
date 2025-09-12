interface Post {
    storeId: string,
    content: string,
    imageUrls: string[]
}

interface FullPost extends Post {
    id: number
}

const mockPosts: FullPost[] = [
    {
        id: 1,
        storeId: "store-1",
        content: "🎉 NEW ARRIVAL ALERT! 🎉\n\nWe're thrilled to introduce our premium Colombian coffee beans! Hand-picked from the finest farms and roasted to perfection. Limited stock available - grab yours now! ☕✨\n\n#Coffee #Premium #Colombian #NewArrival",
        imageUrls: [
            "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop"
        ]
    },
    {
        id: 2,
        storeId: "store-1", 
        content: "🍃 TEA LOVERS REJOICE! 🍃\n\nOur organic tea collection just got bigger! Featuring Earl Grey, Chamomile, and Green Tea blends sourced directly from certified organic farms. Perfect for your evening relaxation routine.\n\n#Tea #Organic #Wellness #Relaxation",
        imageUrls: [
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop"
        ]
    },
    {
        id: 3,
        storeId: "store-1",
        content: "🍫 WEEKEND SPECIAL! 🍫\n\n20% OFF on all Artisan Chocolate Boxes this weekend only! Each box contains 12 unique flavors crafted by our master chocolatiers. Perfect for gifts or treating yourself!\n\nUse code: CHOCO20\n\n#Chocolate #Weekend #Special #Artisan",
        imageUrls: [
            "https://images.unsplash.com/photo-1549007953-2f2dc0b24019?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1511381939415-e44015466834?w=400&h=300&fit=crop"
        ]
    }
];

const createPost = async (post: Post, token: string) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newPost: FullPost = {
                ...post,
                id: mockPosts.length + 1
            };
            mockPosts.push(newPost);
            
            resolve({
                data: newPost,
                status: 201
            });
        }, 700);
    });
};

const getAllPosts = async (id: string, token: string) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const storePosts = mockPosts.filter(p => p.storeId === id);
            resolve({
                data: storePosts,
                status: 200
            });
        }, 500);
    });
};

const getPostbyID = async (postId: string, token: string) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const post = mockPosts.find(p => p.id === parseInt(postId));
            if (post) {
                resolve({
                    data: post,
                    status: 200
                });
            } else {
                reject({
                    status: 404,
                    message: "Post not found"
                });
            }
        }, 300);
    });
};

const updatePost = async (post: FullPost, token: string) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = mockPosts.findIndex(p => p.id === post.id);
            if (index !== -1) {
                mockPosts[index] = post;
                resolve({
                    data: mockPosts[index],
                    status: 200
                });
            } else {
                reject({
                    status: 404,
                    message: "Post not found"
                });
            }
        }, 600);
    });
};

const deletePost = async (postId: number, token: string) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = mockPosts.findIndex(p => p.id === postId);
            if (index !== -1) {
                mockPosts.splice(index, 1);
                resolve({
                    data: { message: "Post deleted successfully" },
                    status: 200
                });
            } else {
                reject({
                    status: 404,
                    message: "Post not found"
                });
            }
        }, 400);
    });
};

export { createPost, getAllPosts, getPostbyID, updatePost, deletePost };