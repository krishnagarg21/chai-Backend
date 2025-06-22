import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;

        //upload local file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            //to be filled later
            resource_type: "auto"
        })

        //file has been uploaded successfully
        console.log("file uploaded successfully on cloudinary: ", response.url);

        //unlink file


        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath); // remove the locally saved temporary file as upload operation failed;


        return null;
    }
}


export {uploadOnCloudinary};