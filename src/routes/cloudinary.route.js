import express from "express";
import { getCloudinarySignature } from "../controllers/cloudinary.controller.js";
import userAuthMiddleware from "../middleware/auth.middleware.js";

const cloudinaryRoute = express.Router();

cloudinaryRoute.get("/signature", userAuthMiddleware, getCloudinarySignature);

export default cloudinaryRoute;
