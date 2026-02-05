import jwt from 'jsonwebtoken';

const JWT_SECRET=process.env.JWT_SECRET;

const authToken =(req,res,next)=>{
   const headerToken = req.headers['authorization'];
   if(!headerToken)
        return res.status(401).json({ error: "Access denied. No token provided." });

   const token= headerToken.split(' ')[1];
   
   if(!token)
        return res.status(401).json({ error: "Access denied. No token provided." });

   try{
    
        const payload = jwt.verify(token, JWT_SECRET)
        req.user=payload
        next();
   }catch(error){
         if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expired. Please login again.'
            });
            }

        return res.status(401).json({
        error: 'Invalid token'
        });
   } 
   
}
export default authToken;