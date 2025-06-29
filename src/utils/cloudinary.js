import {v2 as cloudinary} from "cloudinary"
import fs from "fs"




const uploadOnCloudinary = async (localFilePath) => {
    console.log("check: ",localFilePath)
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
    console.error("❌ Cloudinary Upload Error:", error.message);  // <-- this will show the reason
    if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
    }
    return null;
}

}

const deleteFromCloudinary = async(oldPublicId) => {
    try {
        if(!oldPublicId) return null;

        const response = await cloudinary.uploader.destroy(oldPublicId);

        return response;
        
    } catch (error) {
        console.log("error while deleting file from cloudinary: ", error.message)
        
        return null;
    }
}



export {uploadOnCloudinary, cloudinary, deleteFromCloudinary }