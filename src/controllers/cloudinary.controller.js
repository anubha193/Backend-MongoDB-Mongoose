import { uploadOnCloudinary , cloudinary} from "../utils/cloudinary.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

export const getCloudinarySignature = asyncHandler(async (req, res) => {
  // Optional: require login
  console.log("Hello")
  if (!req.user) throw new ApiError(401, "Unauthorized");

  const timestamp = Math.round(Date.now() / 1000);

  // params you want to lock (must match client upload)
  const paramsToSign = {
    timestamp,
    folder: "videos",
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET
  );

  return res.status(200).json({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    timestamp,
    signature,
    folder: "videos",
  });
});

