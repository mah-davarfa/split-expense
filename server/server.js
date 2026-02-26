import "dotenv/config";
// dotenv.config();
import connectDB from './config/database.js';
import app from './app.js';





const PORT = process.env.PORT || 3011;

async function statrServer(){

    await connectDB()
    
    app.listen(PORT,()=>{
        console.log(`server is listening on port : ${PORT}`)
    })

}
statrServer()