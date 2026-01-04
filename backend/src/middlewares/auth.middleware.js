import { config } from "dotenv";
config();

import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const isAuthenticated = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers?.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new ApiError(401, "Unauthorized: No token provided");
    }

    const token = authHeader.slice(7).trim();

    if (!process.env.JWT_ACCESS_TOKEN_SECRET) {
        throw new ApiError(
            500,
            "Server misconfiguration: JWT secret missing"
        );
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
    } catch (error) {
        const msg =
            error.name === "TokenExpiredError"
                ? "Session expired. Refresh and get new token."
                : "Invalid or tampered token.";
        throw new ApiError(401, msg);
    }

    if (!decoded?.id) {
        throw new ApiError(401, "Unauthorized: Token payload is invalid");
    }

    const user = await User.findByPk(decoded.id);

    if (!user) {
        throw new ApiError(401, "Unauthorized: User no longer exists");
    }

    req.user = user;
    next();
});

// future scope admin panel
const isAuthorised = () =>
    asyncHandler(async (req, res, next) => {
        next();
    });

export {
    isAuthenticated,
    isAuthorised,
};
