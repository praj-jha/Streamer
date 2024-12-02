class ApiResponse {
    constructor(statusCode, data, message = "Success", token="") {
        this.statusCode = statusCode
        this.token = token,
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}


export { ApiResponse }