import mongoose from "mongoose"
import { db_name } from "../constants.js"
import express from "express"

const app = express();


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${db_name}`)
        
        console.log(`\n MongoDB connected Successfully !! DB Host: ${connectionInstance.connection.host}`)


    } catch (error) {
        console.error("ERROR: ", error);
        process.exit(1);
    }
}


export default connectDB