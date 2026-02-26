import bcrypt from 'bcrypt';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

const SALT_ROUNDS= Number(process.env.SALT_ROUNDS || 10);


//helper function
const httpErrorHandler =(message,status)=>{
       const err = new Error(
        message
       )
       err.status=status;
       return err;
}

const signup = async(req,res, next)=>{
  try{
    const {name ,email ,password }= req.body;

    if(!name || !email || !password )
      return next(httpErrorHandler('name,email,password are required !', 400));
   
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase()))
      return next(httpErrorHandler('Email format is not valid', 400));
    
    if(!/^[^<>&]+$/.test(name.trim()))
      return next(httpErrorHandler('name  cannot contain <, >, or &',400));
    
    
    const cleanUser = await  User.findOne({email:email.trim().toLowerCase()})
    if(cleanUser)
        return next(httpErrorHandler('email is already exist',409))

    const SALT = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password.trim(),SALT);
    
    const newUser =  {
        name:name.trim(),
        email: email.trim().toLowerCase(),
        password:hashedPassword,
    }
   
   
    const user= await User.create(newUser)

    
     const payload= {
      userId:user._id,
        name:user.name,
        email:user.email,
     }
    const token= generateToken(payload)

    res.status(201).json({message:"sinup succesfully", token:token,user: { userId: user._id, name: user.name, email: user.email }})

   }catch(err){
    next(err)
   }
}
export default signup;