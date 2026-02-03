import mongoose from "mongoose"

const connectDB= async()=>{
    const uri = process.env.MONGODB_URI;
    if(!uri){
        throw new Error ("MONGODB_URI is missing in .env")
    }
    try{
        await mongoose.connect(uri)
        console.log('MongoDB connected')
    }catch(error){
            console.error('mongooDB ATLAS is not conecting , ERROR is :',error.message)
            process.exit(1)
    }

} 
export default connectDB;