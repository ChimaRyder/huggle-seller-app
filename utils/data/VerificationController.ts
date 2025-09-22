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
        message: "Your verification request is being reviewed by our team. We will update you within 3-5 business days.",
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
        message: "Congratulations! Your verification has been approved. You can now access all seller features.",
        createdAt: "2024-01-25T09:15:00Z",
        updatedAt: "2024-01-28T16:45:00Z"
    },
    {
        id: "req-003",
        sellerId: "user-1",
        governmentIdImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=250&fit=crop",
        status: 0, // Pending
        governmentIdType: "Passport",
        businessPermitPdfUrl: "https://example.com/business-permit-3.pdf",
        message: "Your verification request has been submitted and is in the queue for review.",
        createdAt: "2024-02-15T08:45:00Z",
        updatedAt: "2024-02-15T08:45:00Z"
    },
    {
        id: "req-004",
        sellerId: "user-1",
        governmentIdImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612d1eb?w=400&h=250&fit=crop",
        status: 3, // Rejected
        governmentIdType: "National ID",
        businessPermitPdfUrl: "https://example.com/business-permit-4.pdf",
        message: "Unfortunately, your verification request was rejected due to unclear document images. Please resubmit with clearer photos.",
        createdAt: "2024-01-15T14:20:00Z",
        updatedAt: "2024-01-18T10:30:00Z"
    },
    {
        id: "req-005",
        sellerId: "user-2", // Different user for testing
        governmentIdImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=250&fit=crop",
        status: 2, // Approved
        governmentIdType: "Driver's License",
        businessPermitPdfUrl: "https://example.com/business-permit-5.pdf",
        message: "Your verification has been approved successfully.",
        createdAt: "2024-02-01T10:00:00Z",
        updatedAt: "2024-02-03T15:30:00Z"
    }
];

const getRequests = async (token: string, sellerId: string) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // For demo purposes, first try to get requests for the specific seller
            let sellerRequests = mockRequests.filter(r => r.sellerId === sellerId);

            // If no requests found for this seller, return some demo requests
            // by updating them to have the current seller's ID
            if (sellerRequests.length === 0) {
                // Return some sample requests for demo purposes
                sellerRequests = mockRequests
                    .filter(r => r.sellerId === "user-1")
                    .map(r => ({ ...r, sellerId }));
            }

            // Final fallback: if still no requests, ensure we have at least some demo data
            if (sellerRequests.length === 0) {
                sellerRequests = [
                    {
                        id: "demo-001",
                        sellerId,
                        governmentIdImageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=250&fit=crop",
                        status: 1, // Processing
                        governmentIdType: "Driver's License",
                        businessPermitPdfUrl: "https://example.com/business-permit.pdf",
                        message: "Your verification request is being reviewed by our team.",
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                ];
            }

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