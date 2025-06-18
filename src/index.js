// require('dotenv').config({path: './env'});
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path: './.env'
});

// // -r dotenv/config --experimental-json-modules

connectDB();


























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
