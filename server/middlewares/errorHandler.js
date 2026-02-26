const errorHandler =(err,req,res,next)=>{
    console.error("🔥 ERROR:", err);
    if(res.headersSent) return next(err)

        let message= err?.message || 'internal error'
        let statusCode= err?.status || err?.statusCode || 500;

        if(err?.name ==='ValidationError'){
            message = "Validation DB failed"
            statusCode= 400
        }else if(err?.name==='CastError'){
            statusCode = 400
            message='Invalid ID format in DB'
        }

     return   res.status(statusCode).json({
        error:{
            message,
            statusCode,
            ...(process.env.NODE_ENV==="development" && {stack:err?.stack})
        }
    })
}
export default errorHandler;