interface Request {
    id: string,
    sellerId: string,
    governmentIdImageUrl: string,
    status: number,
    governmentIdType: string,
    businessPermitPdfUrl: string,
    message: string,
    createdAt: string,
    updatedAt: string
}

interface InitialRequest {
    sellerId: string,
    governmentIdImageUrl: string,
    governmentIdType: string,
    businessPermitPdfUrl: string,
}

const mockRequests: Request[] = [
    {
        id: "req-001",
        sellerId: "user-1",
        governmentIdImageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=250&fit=crop",
        status: 1, // Processing
        governmentIdType: "Driver's License",
        businessPermitPdfUrl: "https://example.com/business-permit.pdf",
        message: "Your verification request is being reviewed by our team.",
        createdAt: "2024-02-10T11:30:00Z",
        updatedAt: "2024-02-12T14:20:00Z"
    },
    {
        id: "req-002", 
        sellerId: "user-1",
        governmentIdImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop",
        status: 2, // Approved
        governmentIdType: "SSS ID",
        businessPermitPdfUrl: "https://example.com/business-permit-2.pdf",
        message: "Your verification has been approved. Welcome to Huggle!",
        createdAt: "2024-01-25T09:15:00Z",
        updatedAt: "2024-01-28T16:45:00Z"
    }
];

const getRequests = async (token: string, sellerId: string) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const sellerRequests = mockRequests.filter(r => r.sellerId === sellerId);
            resolve({
                data: sellerRequests,
                status: 200
            });
        }, 400);
    });
};

const getRequest = async (token: string, id: string) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const request = mockRequests.find(r => r.id === id);
            if (request) {
                resolve({
                    data: request,
                    status: 200
                });
            } else {
                reject({
                    status: 404,
                    message: "Verification request not found"
                });
            }
        }, 300);
    });
};

const createRequest = async (token: string, request: InitialRequest) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newRequest: Request = {
                id: `req-${String(mockRequests.length + 1).padStart(3, '0')}`,
                sellerId: request.sellerId,
                governmentIdImageUrl: request.governmentIdImageUrl,
                status: 0, // Pending
                governmentIdType: request.governmentIdType,
                businessPermitPdfUrl: request.businessPermitPdfUrl,
                message: "Your verification request has been submitted and is under review.",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            mockRequests.push(newRequest);
            
            resolve({
                data: newRequest,
                status: 201
            });
        }, 800);
    });
};

export { Request, getRequests, getRequest, createRequest, InitialRequest };