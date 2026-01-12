import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js'
import User from '../models/user.model.js';

const registerUser = asyncHandler(async (request, response, next) => {
    const {fullName, userName, email, password} = request.body;
    console.log(fullName, userName, email, password);
    if([fullName, userName, email, password].some(field => !field)) {
       throw new ApiError("400", "All fields are required");
    }

    const user = await User.findOne({$or: [{userName}, {email} ]});
    if(user)
        throw new ApiError("409", "User with given email or username already exists");
    const avatarLocalPath = request.files?.avatar?.[0]?.path;
    const coverImageLocalPath = request.files?.coverImage?.[0]?.path;
    if(!avatarLocalPath) {
        throw new ApiError("400", "Avatar is required");
    }

    console.log("Register User Controller");
    response.status(200).json({
        success: true,
        message: "User registered successfully"
    });
});

export { registerUser };