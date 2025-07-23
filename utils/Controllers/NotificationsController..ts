import axios from "axios"

interface Notification {
    id : string,
    userId : string,
    title : string,
    message : string,
    createdAt : string,
    isRead : boolean,
    type : number,
    relatedEntityId : string
}

const getNotifications = async (token : string , id : string) => {
    const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/notifications?userId=${id}`, 
        {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: `Bearer ${token}`,
          },
        }
    );

    return response;
}

const getUnreadCount = async (token : string, id : string) => {
    const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/notifications/unread-count?userId=${id}`, 
        {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: `Bearer ${token}`,
          },
        }
    );

    return response;
}

export {Notification, getNotifications, getUnreadCount};