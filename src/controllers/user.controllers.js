import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/User.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const generateTokens = async (user) => {
    try {
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
}


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
    const normalizedFullName = typeof fullName === "string" ? fullName.trim() : "";
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const normalizedUsername = typeof username === "string" ? username.trim().toLowerCase() : "";
    const passwordValue = typeof password === "string" ? password : "";

    // validation - not empty
    if ([normalizedFullName, normalizedEmail, normalizedUsername, passwordValue].some((field) => typeof field !== "string" || field.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // check if user already exists: username, email
    const existerUser = await User.findOne({
        $or: [{ email: normalizedEmail }, { username: normalizedUsername }]
    });

    if (existerUser) {
        throw new ApiError(400, "User already exists");
    }

    // check for images, check for avatar
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverimage?.[0]?.path;

    if (!avatarLocalPath || !coverImageLocalPath) {
        throw new ApiError(400, "Avatar and cover image are required");
    }

    // upload them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar || !coverImage) {
        throw new ApiError(400, "Failed to upload images to cloudinary");
    }

    // create user object - create entry in db
    const user = await User.create({
        fullName: normalizedFullName,
        avatar: avatar.url,
        coverimage: coverImage?.url || "",
        email: normalizedEmail,
        password: passwordValue,
        username: normalizedUsername
    });

    // remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    // check for user creation
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user");
    }

    // return res
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered Successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // username or email
    // find the user
    // password check
    // acess and refresh token
    // send cookie

    const { email, username, password } = req.body;
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const normalizedUsername = typeof username === "string" ? username.trim().toLowerCase() : "";
    const passwordValue = typeof password === "string" ? password : "";

    if ((!normalizedUsername && !normalizedEmail) || !passwordValue || passwordValue.trim() === "") {
        throw new ApiError(400, "Username or email and password are required");
    }

    const user = await User.findOne({
        $or: [
            ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
            ...(normalizedUsername ? [{ username: normalizedUsername }] : [])
        ]
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(passwordValue);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid password");
    }

    const { accessToken, refreshToken } = await generateTokens(user);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: loggedInUser,
                accessToken,
                refreshToken
            }, "User logged in successfully")
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    
    await User.findByIdAndUpdate(req.user._id, {
        $set: { refreshToken: null }
    });

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
})


export { registerUser,loginUser,logoutUser};
