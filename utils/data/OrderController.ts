interface Order {
    id: string,
    buyerId: string,
    storeId: string,
    productId: string[],
    quantity: number[],
    totalPrice: number,
    createdAt: Date,
    updatedAt: Date,
    status: number
}

const mockOrders: Order[] = [
    {
        id: "ord-001",
        buyerId: "buyer-1",
        storeId: "store-1",
        productId: ["1", "2"],
        quantity: [2, 1],
        totalPrice: 42.50,
        createdAt: new Date("2024-02-15T10:30:00Z"),
        updatedAt: new Date("2024-02-15T11:00:00Z"),
        status: 2 // Completed
    },
    {
        id: "ord-002", 
        buyerId: "buyer-2",
        storeId: "store-1",
        productId: ["3"],
        quantity: [1],
        totalPrice: 25.00,
        createdAt: new Date("2024-02-14T14:20:00Z"),
        updatedAt: new Date("2024-02-14T15:30:00Z"),
        status: 1 // Processing
    },
    {
        id: "ord-003",
        buyerId: "buyer-3",
        storeId: "store-1",
        productId: ["1"],
        quantity: [3],
        totalPrice: 45.00,
        createdAt: new Date("2024-02-13T09:15:00Z"),
        updatedAt: new Date("2024-02-13T09:45:00Z"),
        status: 0 // Pending
    },
    {
        id: "ord-004",
        buyerId: "buyer-1",
        storeId: "store-1", 
        productId: ["2", "3"],
        quantity: [2, 1],
        totalPrice: 50.00,
        createdAt: new Date("2024-02-12T16:45:00Z"),
        updatedAt: new Date("2024-02-13T10:00:00Z"),
        status: 2 // Completed
    }
];

const getAllOrders = async (token: string) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                data: mockOrders,
                status: 200
            });
        }, 600);
    });
};

const getOrderbyID = async (orderId: string, token: string) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const order = mockOrders.find(o => o.id === orderId);
            if (order) {
                resolve({
                    data: order,
                    status: 200
                });
            } else {
                reject({
                    status: 404,
                    message: "Order not found"
                });
            }
        }, 400);
    });
};

const updateOrder = async (token: string, order: Order) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = mockOrders.findIndex(o => o.id === order.id);
            if (index !== -1) {
                mockOrders[index] = {
                    ...order,
                    updatedAt: new Date()
                };
                resolve({
                    data: mockOrders[index],
                    status: 200
                });
            } else {
                reject({
                    status: 404,
                    message: "Order not found"
                });
            }
        }, 500);
    });
};

const deletePost = async (postId: number, token: string) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                data: { message: "Post deleted successfully" },
                status: 200
            });
        }, 400);
    });
};

export { Order, getAllOrders, getOrderbyID, updateOrder };