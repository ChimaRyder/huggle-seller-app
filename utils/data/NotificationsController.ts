interface Notification {
    id: string,
    userId: string,
    title: string,
    message: string,
    createdAt: string,
    isRead: boolean,
    type: number,
    relatedEntityId: string
}

const mockNotifications: Notification[] = [
    {
        id: "notif-001",
        userId: "user-1",
        title: "New Order Received",
        message: "You have received a new order for Premium Coffee Beans",
        createdAt: "2024-02-15T10:30:00Z",
        isRead: false,
        type: 1, // Order notification
        relatedEntityId: "ord-001"
    },
    {
        id: "notif-002",
        userId: "user-1", 
        title: "Product Review",
        message: "Your Organic Tea Collection received a 5-star review!",
        createdAt: "2024-02-14T16:45:00Z",
        isRead: false,
        type: 2, // Review notification
        relatedEntityId: "review-001"
    },
    {
        id: "notif-003",
        userId: "user-1",
        title: "Low Stock Alert",
        message: "Artisan Chocolate Box is running low on stock (5 remaining)",
        createdAt: "2024-02-13T09:15:00Z",
        isRead: true,
        type: 3, // Stock notification
        relatedEntityId: "3"
    },
    {
        id: "notif-004",
        userId: "user-1",
        title: "Payment Received", 
        message: "Payment of ₱42.50 has been received for order #ord-001",
        createdAt: "2024-02-12T14:20:00Z",
        isRead: true,
        type: 4, // Payment notification
        relatedEntityId: "ord-001"
    },
    {
        id: "notif-005",
        userId: "user-1",
        title: "Store Verification Update",
        message: "Your store verification request is being processed",
        createdAt: "2024-02-10T11:30:00Z",
        isRead: true,
        type: 5, // Verification notification
        relatedEntityId: "verification-001"
    }
];

const getNotifications = async (token: string, id: string) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const userNotifications = mockNotifications.filter(n => n.userId === id);
            resolve({
                data: userNotifications,
                status: 200
            });
        }, 400);
    });
};

const getUnreadCount = async (token: string, id: string) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const unreadCount = mockNotifications.filter(n => 
                n.userId === id && !n.isRead
            ).length;
            resolve({
                data: { count: unreadCount },
                status: 200
            });
        }, 200);
    });
};

const markRead = async (token: string, id: string) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            mockNotifications.forEach(n => {
                if (n.userId === id) {
                    n.isRead = true;
                }
            });
            resolve({
                data: { message: "All notifications marked as read" },
                status: 200
            });
        }, 300);
    });
};

export { Notification, getNotifications, getUnreadCount, markRead };