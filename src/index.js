// require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import connectDB from "./db/Index.js";
import {app} from './app.js'
dotenv.config({
    path: './Public/Temp/.env'
})



connectDB()
.then(() => {
    const port = process.env.PORT || 8000;
    app.listen(port, () => {
        console.log(`⚙️ Server is running at port : ${port}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})



