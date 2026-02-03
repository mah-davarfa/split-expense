
import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3011;
 function statrServer(){

    app.listen(PORT,()=>{
        console.log(`server is listening on port : ${PORT}`)
    })

}
statrServer()