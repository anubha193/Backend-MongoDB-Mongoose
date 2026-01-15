import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const userAuthMiddleware = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized: No token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded._id)
      .select("-password -refreshToken");

    if (!user) {
      throw new ApiError(401, "Unauthorized: User not found");
    }

    req.user = user
    next();
  } catch (error) {
    console.log(error)
    throw new ApiError(401, "Unauthorized: Invalid token");
  }
});

export default userAuthMiddleware;
