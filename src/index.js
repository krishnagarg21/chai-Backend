// require('dotenv').config({path: './env'});
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";
import { cloudinary } from "./utils/cloudinary.js";

dotenv.config({
    path: './.env'
});

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});


// // -r dotenv/config --experimental-json-modules

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port: ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("Mongo DB connection failed!!!!", err);

})


























/*
import express from "express"
const app = express();

;(async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/${db_name}`)

        app.on("error", (error) => {
            console.log("error: ", error);
            throw error
        })

        app.listen(process.env.port, () => {
            console.log(`App is listening on ${process.env.port}`)
        })

    } catch (error) {
        console.error("Error: ", error);
        throw error
    }
})()
*/
