const asyncHandler = (fn) => async (req, res , next) =>{
    try{
        await fn(req , res ,next)

    } catch (error) {
        res.status(typeof error.code ==='number'? err.code :500).json({
            success: false,
            message:error.message
        })
    }
}


export {asyncHandler}
