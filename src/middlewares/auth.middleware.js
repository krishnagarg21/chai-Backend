import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { user } from "../models/user.models.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if(!token){
            throw new ApiError(401, "Unauthorized request");
        }
    
        //token verify
        const decodedToken = jwt.verify(token, process.env.ACCESS_SECRET_KEY)
    
        const userdecoded = await user.findById(decodedToken?._id)
        .select("-password -refreshToken")
    
        if(!userdecoded) throw new ApiError(401, "Invalid access Token")
    
        req.User = userdecoded; 
        next()
    } catch (error) {
        throw new ApiError(401, error?.mesasage || "Invalid access Token function")
    }
})

