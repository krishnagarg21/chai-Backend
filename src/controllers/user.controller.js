import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {user} from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { json } from "express";
import {jwt} from "jsonwebtoken"

const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const userFound = await user.findById(userId)
        const accessToken = userFound.generateAccessToken()
        const refreshToken = userFound.generateRefreshToken()

        userFound.refreshToken = refreshToken
        await userFound.save({validateBeforeSave: false});


        return {accessToken, refreshToken};

    } catch (error) {
        throw new ApiError(500, "something went wrong during generation of tokens")
    }
}

const registerUser = asyncHandler( async (req, res, next) => {
    
    const {fullname, email, password, username} = req.body
    console.log("email: ", email);

    // validations
    if(
        [fullname, email, password, username].some((field) => 
        field?.trim() === "")
    ){
        throw new ApiError(400, field+" is requireeeeeeeed");
    }

    // user already exists or not
    const existedUser = await user.findOne({
        $or: [{username}, {email}]
    })

    if(existedUser){
        throw new ApiError(409, "User with email or userName already exists");
    }

    //check for images
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    
    
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required");
    }
    // console.log(avatarLocalPath)

    // upload on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    // console.log(avatar);
    
    
    if(!avatar) throw new ApiError(400, "Avatar is required");


    // db entry
    const userentry = await user.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        username: username.toLowerCase(),
        email,
        password
    })

    const checkCreation = await user.findById(userentry._id).select(
        "-password -refreshTokens"
    )

    if(!checkCreation) throw new ApiError(500, "something went wrong whhile registering the user");

    return res.status(201).json(
        new ApiResponse(200, checkCreation, "User registered successfully")
    )



    




});

const loginUser = asyncHandler( async (req, res, next) => {

    //get data from req body(front end);
    const {username, email, password} = req.body;
    console.log(email, username, password);

    //atleast one is required
    if(!username && !email) throw new ApiError(400, "username or password is required");

    //find user with same detail
    const userfound = await user.findOne({
        $or: [{username}, {email}]
    })

    if(!userfound) throw new ApiError(404, "No user found!!!");

    //password check
    const isPasswordValid = await userfound.isPasswordCorrect(password)

    if(!isPasswordValid) throw new ApiError(401, "Password incorrect!!!");

    //access and refresh token bnaao
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(userfound._id);

    //send in cookie
    const loggedInUser = await user.findById(userfound._id).
    select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User Logged In Successfully"
        )
    )



    
})


const logoutUser = asyncHandler( async (req, res, next) => {

    await user.findByIdAndUpdate(
        req.User._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    console.log(req.User.username);
    

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out Successfully!!"))    
    

})

const refreshAccessToken = asyncHandler(async (req, res, next) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request");
    } 

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_SECRET_KEY,
        )
    
        const User = await user.findById(decodedToken?._id)
    
        if(!User){
            throw new ApiError(401, "Invalid refresh token");
        } 
    
        if(incomingRefreshToken !== User?.refreshToken){
            throw new ApiError(401, "refresh token is expired or used");
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newrefreshToken} = await generateAccessAndRefreshTokens(User._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newrefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newrefreshToken},
                "AccessToken refreshed Successfully"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid refreshToken")
    }

})

const changeCurrentPassword = asyncHandler(async (req, res, next) => {
    const {oldPassword, newPassword} = req.body

    const User = await user.findById(req.User?._id)

    const isPasswordCorrect = await User.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect){
        throw new ApiError(400, "invalid old password");
    }

    //password set krna hai
    User.password = newPassword;
    await User.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Password Changed Successfully")
    )
})

const getCurrentUser = asyncHandler(async (req, res, next) => {
    return res
    .status(200)
    .json(200, req.User, "current User fetched Sucessfully")
})

const updateAccountDetails = asyncHandler(async (req, res, next) => {
    const {fullname, email} = req.body

    if(!fullname || !email){
        throw new ApiError(400, "All are required");
    }

    //jwt se verify middleware krega
    const User =  await user.findByIdAndUpdate(
        req.User._id,
        {
            $set: {
                fullname,
                email
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, User, "Account details Updated Successfully"))
})

const updateUserAvatar = asyncHandler(async (req, res, next) => {
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400, "Error while uploading on cloudinary");
    }

    const User = await user.findByIdAndUpdate(
        req.User._id,
        {
            $set: {
                avatar: avatar.url
            }
        }, 
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, User, "Avatar Updated Successfully"))
})

const updateCoverImage = asyncHandler(async (req, res, next) => {
    const coverImageLocalPath = req.file?.path;

    if(!coverImageLocalPath){
        throw new ApiError(400, "CoverImage is required or missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!coverImage.url){
        throw new ApiError(400, "Error while uploading coverImage on Cloudinary")
    }

    const User = await findByIdAndUpdate(
        req.User._id,
        {
            $set: {coverImage: coverImage.url}
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        200,
        User,
        "coverImage Updated Successfully"
    )
})

export {registerUser, loginUser, logoutUser,
        refreshAccessToken, changeCurrentPassword,
        getCurrentUser, updateAccountDetails,
        updateUserAvatar, updateCoverImage,
    };