import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/User.model.js";

export const verifyJWT = asyncHandler(async(req, _, next) => {
    const authorization = req.header("Authorization");
    const bearerToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
    const token = req.cookies?.accessToken || bearerToken;

    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }

    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
        throw new ApiError(500, "Access token secret is not configured");
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, secret);
    } catch {
        throw new ApiError(401, "Invalid or expired access token");
    }

    if (typeof decodedToken !== "object" || !decodedToken.id) {
        throw new ApiError(401, "Invalid access token");
    }

    const user = await User.findById(decodedToken.id).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(401, "Invalid access token");
    }

    req.user = user;
    next();
})