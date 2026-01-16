import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js';
import User from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import jwt from "jsonwebtoken";


//generate access and refresh token
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findOne(userId);
        if (!user)
            throw new ApiError("User not found", 404, "User does not exist");
        const refreshToken = user.generateRefreshToken();
        const accessToken = user.generateAccessToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError("500", "Error generating tokens");
    }
}
//register user controller
const registerUser = asyncHandler(async (request, response, next) => {
    const { fullName, userName, email, password } = request.body;
    console.log(fullName, userName, email, password);
    if ([fullName, userName, email, password].some(field => !field)) {
        throw new ApiError("400", "All fields are required");
    }
    console.log("Checking existing user");
    const user = await User.findOne({ $or: [{ userName }, { email }] });
    if (user) {
        console.log("User already exists");
        return response.status(200).json(
            new ApiResponse(200, user, "User fetched successfully")
        );
    }
    // console.log("Uploaded files:", request.files);
    const avatarLocalPath = request.files?.avatar?.[0]?.path;
    // console.log("Avatar local path:", request.files?.avatar);
    const coverImageLocalPath = request.files?.coverImage?.[0]?.path;
    if (!avatarLocalPath) {
        throw new ApiError("400", "Avatar is required");
    }

    const avatarUploadResponse = await uploadOnCloudinary(avatarLocalPath);
    // console.log("Avatar upload response:", avatarUploadResponse);
    let coverImageUploadResponse = null;
    if (coverImageLocalPath) {
        coverImageUploadResponse = await uploadOnCloudinary(coverImageLocalPath);
    }
    if (!avatarUploadResponse)
        throw new ApiError("500", "Error while uploading avatar image");

    const userResponse = await User.create({
        fullName,
        userName: userName.toLowerCase(),
        email,
        password,
        avatar: avatarUploadResponse.url,
        coverImage: coverImageUploadResponse ? coverImageUploadResponse.url : undefined
    });
    const UserID = await User.findById(userResponse._id).select(
        "-password -refreshToken -v"
    );
    if (!UserID)
        throw new ApiError("500", "Error while creating user");
    response.status(201).ApiResponse = new ApiResponse(true, "User registered successfully", UserID);


    console.log("Register User Controller");
    response.status(200).json({
        success: true,
        message: "User registered successfully",
        data: UserID
    });
});

//login user controller
const loginUser = asyncHandler(async (request, response, next) => {
    const { userName, email, password } = request.body;
    if ((!userName && !email) || !password) {
        throw new ApiError("400", "Username or email and password are required");
    }
    let userDetails = await User.findOne({ $or: [{ userName }, { email }] });;
    if (!userDetails)
        throw new ApiError("User not found", 404, "User does not exist with the provided username or email");
    const isPasswordValid = await userDetails.comparePasswords(password);
    if (!isPasswordValid) {
        throw new ApiError("401", "Invalid password");
    }
    //generate access and refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(userDetails._id);
    userDetails = await User.findById(userDetails._id).select(
        "-password -refreshToken -v"
    );

    //set cookies for access and refresh token
    const option = {
        httpOnly: true,
        secure: true
    };
    return response.
        status(200).
        cookie("refreshToken", refreshToken, option).
        cookie("accessToken", accessToken, option).
        json(
            new ApiResponse(
                200,
                {
                    user: userDetails,
                    accessToken,
                    refreshToken: refreshToken || ""
                },
                "User logged in successfully"
            )
        );

});

//logout user controller
const logoutUser = asyncHandler(async (request, response, next) => {
    const user = request.user;
    await User.findByIdAndUpdate(
        request.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    if (!user)
        throw new ApiError("401", "Unauthorized: User not found");
    const options = {
        httpOnly: true,
        secure: true
    }

    return response
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))
});

//refresh access token
const refreshAccessToken = asyncHandler(async (request, response, next) => {
    const token = request.cookies?.refreshToken || request.headers.authorization?.replace("Bearer ", "");
    console.log(request.cookies)
    if (!token)
        throw new ApiError(401, "Refresh token not found!!");
    try {
        const decodedResponse = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedResponse._id)
        if (!user)
            throw new ApiError(401, "Invalid refresh token");
        if (user?.refreshToken != token)
            throw new ApiError(401, "Refresh token is expired or used");
        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

        return response
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, accessToken, refreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(400, "Something went wrong")
    }
})

//for update password
const changePassword = asyncHandler(async (request, response, next) => {
    const user = request.user;
    const { oldPassword, newPassword } = request.body;
    if (!user)
        throw new ApiError(404, "User not Logged in , please login");
    const DBUser = await User.findOne(user._id);
    if (!DBUser)
        throw new ApiError(404, "user not found in DB records");
    const isPasswordValid = DBUser.comparePasswords(oldPassword);
    if (!isPasswordValid)
        throw new ApiError(500, "invalid old password");
    DBUser.password = newPassword;
    const updatedUser = await DBUser.save({ validateBeforeSave: false });

    return response.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    )
});


//for getting current user
const getCurrentUser = asyncHandler(async (request, response, next) => {
    const user = request.user;
    if (!user)
        throw new ApiError(404, "User not Logged in , please login");
    const DBUser = await User.findOne(user._id).select("-password -refreshToke");
    if (!DBUser)
        throw new ApiError(404, "user not found in DB records");
    return response.status(200).json(new ApiResponse(200, DBUser, "user details fetched successfully"));
});


//for update user details
const updateUserDetails = asyncHandler(async (request, response, next) => {

});


//for updating avatar image
const updateAvatarImage = asyncHandler(async (request, response, next) => {
    const avatartImage = request.file?.path;
    console.log(request.file);
    const user = request?.user;
    if (!user)
        throw new ApiError(404, "User not logged In");
    if (!avatartImage)
        throw new ApiError(404, "avatar image not found!!");
    const avatarImageClodinaryPath = await uploadOnCloudinary(avatartImage);
    if (!avatarImageClodinaryPath)
        throw new ApiError(404, "Error while uploading image on clodinary!!");
    User.findByIdAndUpdate(user._id, {
        avatar: avatarImageClodinaryPath.url || ""
    }, {
        new: true
    })
    return response.status(200).json(
        new ApiResponse(200, {
            avatarImageClodinaryPath
        },
            "Image updated on Clodinary Successfully!!")
    )
});


//for updating coverImage
const updateCoverImage = asyncHandler(async (request, response, next) => {
    const coverImage = request.file?.path;
    const user = request?.user
    if (!coverImage)
        throw new ApiError(404, "avatar image not found!!");
    if (!user)
        throw new ApiError(404, "User not logged In");
    const coverImageClodinaryPath = await uploadOnCloudinary(coverImage);
    if (!coverImageClodinaryPath)
        throw new ApiError(404, "Error while uploading image on clodinary!!");
     User.findByIdAndUpdate(user._id, {
        avatar: coverImageClodinaryPath.url || ""
    }, {
        new: true
    })
    return response.status(200).json(
        new ApiResponse(200, {
            coverImageClodinaryPath
        },
            "Image updated on Clodinary Successfully!!")
    )
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateUserDetails,
    updateAvatarImage,
    updateCoverImage
};