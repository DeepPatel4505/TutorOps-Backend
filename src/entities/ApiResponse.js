class ApiResponse {
    constructor(data = {}, message = 'Success') {
        this.success = true;
        this.data = data;
        this.message = message;
    }

    static success(message, data = {}) {
        return new ApiResponse(data, message);
    }
}

export default ApiResponse;
