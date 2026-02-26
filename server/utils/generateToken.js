import jwt from 'jsonwebtoken';


const generateToken =(payload)=>{
    const JWT_SECRET = process.env.JWT_SECRET;
      if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is missing. Check server/.env and dotenv loading order.");
  }
    const token = jwt.sign(payload,JWT_SECRET,{expiresIn:'7d'})
    return token
}
export default generateToken;