import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error("MongoDB URI not found in environment variables.");
        }

        const parsedUri = new URL(mongoUri);
        parsedUri.pathname = `/${DB_NAME}`;

        const connectionInstance = await mongoose.connect(parsedUri.toString())
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1)
    }
}

export default connectDB