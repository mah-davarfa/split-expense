
import app from './app.js';
import dotenv from 'dotenv';
import connectDB from './config/database.js';

dotenv.config();

const PORT = process.env.PORT || 3011;

async function statrServer(){

    await connectDB()
    
    app.listen(PORT,()=>{
        console.log(`server is listening on port : ${PORT}`)
    })

}
statrServer()