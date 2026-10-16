import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/User.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    // get user details from frontend
    const { fullName, email, username, password } = req.body;
    console.log("email: ", email);
    // validation - not empty
    if(
        [fullName, email, username, password].some((field) => !field ||
        field.trim() === "")
    ){
        throw new ApiError(400, "All fields are required" )
    }
    // check if user already exists: username, email
    const existerUser = await User.findOne({
        $or: [{ email }, { username }]
    })
    //
    if (existerUser) {
        throw new ApiError(400, "User already exists")
    }
    // check for images, check for avatar
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverimage?.[0]?.path;

    if (!avatarLocalPath || !coverImageLocalPath) {
        throw new ApiError(400, "Avatar and cover image are required")
    }

    // upload them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar || !coverImage) {
        throw new ApiError(400, "Failed to upload images to cloudinary")
    }

    // create user object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverimage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // check for user creation
     if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user")
     }

    // return res
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
        )
});

export { registerUser };
