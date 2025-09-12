interface Buyer {
    name: string,
    emailAddress: string,
}

const mockBuyers: { [key: string]: Buyer } = {
    "buyer-1": {
        name: "Alice Johnson",
        emailAddress: "alice.johnson@email.com"
    },
    "buyer-2": {
        name: "Bob Smith", 
        emailAddress: "bob.smith@email.com"
    },
    "buyer-3": {
        name: "Carol Davis",
        emailAddress: "carol.davis@email.com"
    },
    "buyer-4": {
        name: "David Wilson",
        emailAddress: "david.wilson@email.com"
    }
};

const getBuyer = async (token: string, id: string) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const buyer = mockBuyers[id];
            if (buyer) {
                resolve({
                    data: buyer,
                    status: 200
                });
            } else {
                reject({
                    status: 404,
                    message: "Buyer not found"
                });
            }
        }, 300);
    });
};

export { Buyer, getBuyer };