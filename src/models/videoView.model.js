import mongoose from "mongoose";

const videoViewSchema = new mongoose.Schema({
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    ip: String,
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24 // auto delete after 24h
    }
});


const videoView = mongoose.model("videoView", videoViewSchema);
export default videoView;
