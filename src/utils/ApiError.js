class ApiError extends Error {
    constructor (
        statusCode,
        message = "Something went wrong",
        errors = [],
        // stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors


        // if (stack) {
        //     this.stack = stack              //i need to study these first and then add them
        // } else {
        //     Error.captureStackTrace(this , this.constructor)
        // }
    }
}
export {ApiError}