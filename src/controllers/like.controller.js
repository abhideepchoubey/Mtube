import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"


const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: toggle like on video
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const existingLike = await Like.findOne({
        likedBy: req.user._id,
        video: videoId
    });

    // Unlike
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);

        return res.status(200).json(
            new ApiResponse(
                200,
                null,
                "Video unliked successfully"
            )
        );
    }

    // Like
    const newLike = await Like.create({
        likedBy: req.user._id,
        video: videoId
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            newLike,
            "Video liked successfully"
        )
    );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment id");
    }
    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    const existingLike = await Like.findOne({
        likedBy: req.user._id,
        comment: commentId
    });

    // Unlike
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);

        return res.status(200).json(
            new ApiResponse(
                200,
                null,
                "Comment unliked successfully"
            )
        );
    }

    // Like
    const newLike = await Like.create({
        likedBy: req.user._id,
        comment: commentId
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            newLike,
            "Comment liked successfully"
        )
    );
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid tweet id");
    }
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }
    const existingLike = await Like.findOne({
        likedBy: req.user._id,
        tweet: tweetId
    });

    // Unlike
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res.status(200).json(
            new ApiResponse(
                200,
                null,
                "Tweet unliked successfully"
            )
        );
    }

    // Like
    const newLike = await Like.create({
        likedBy: req.user._id,
        tweet: tweetId
    });
    return res.status(201).json(
        new ApiResponse(
            201,
            newLike,
            "Tweet liked successfully"
        )
    );
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likedVideos = await Like.find({ likedBy: req.user._id, video: { $exists: true } })
        .populate("video")
        .populate("likedBy", "fullname username avatar");
    return res.status(200).json(
        new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}