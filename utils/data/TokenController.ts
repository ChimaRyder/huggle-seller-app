interface PushToken {
    pushToken: string,
    userId: string,
    isActive: boolean
}

const mockPushTokens: PushToken[] = [
    {
        pushToken: "ExponentPushToken[abcd1234efgh5678]",
        userId: "user-1",
        isActive: true
    },
    {
        pushToken: "ExponentPushToken[ijkl9012mnop3456]", 
        userId: "user-2",
        isActive: true
    }
];

const addToken = async (token: string, pushToken: PushToken) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const existingIndex = mockPushTokens.findIndex(pt => 
                pt.userId === pushToken.userId && pt.pushToken === pushToken.pushToken
            );
            
            if (existingIndex === -1) {
                mockPushTokens.push(pushToken);
            }
            
            resolve({
                data: pushToken,
                status: 201
            });
        }, 300);
    });
};

const getToken = async (token: string) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                data: mockPushTokens,
                status: 200
            });
        }, 200);
    });
};

const updateToken = async (token: string, pushToken: PushToken) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = mockPushTokens.findIndex(pt => 
                pt.userId === pushToken.userId
            );
            
            if (index !== -1) {
                mockPushTokens[index] = pushToken;
                resolve({
                    data: pushToken,
                    status: 200
                });
            } else {
                reject({
                    status: 404,
                    message: "Push token not found"
                });
            }
        }, 300);
    });
};

const disableToken = async (token: string, pushToken: PushToken) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const index = mockPushTokens.findIndex(pt => 
                pt.userId === pushToken.userId && pt.pushToken === pushToken.pushToken
            );
            
            if (index !== -1) {
                mockPushTokens[index].isActive = false;
            }
            
            resolve({
                data: { ...pushToken, isActive: false },
                status: 200
            });
        }, 300);
    });
};

export { PushToken, addToken, getToken, updateToken, disableToken };