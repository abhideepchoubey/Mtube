import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body
    if (!content?.trim()) {
        throw new ApiError(400, "Content is required");
    }
    const tweet = await Tweet.create({
        content: content.trim(),
        owner: req.user._id
    })
    return res.status(201).json(
        new ApiResponse(201, tweet, "Tweet created successfully")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user id");
    }
    const tweets = await Tweet.find({ owner: new mongoose.Types.ObjectId(userId) })
        .populate("owner", "fullname username avatar");
    return res.status(200).json(
        new ApiResponse(200, tweets, "User tweets fetched successfully")
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid tweet id");
    }
    const existingTweet = await Tweet.findById(tweetId)
    if (!existingTweet) {
        throw new ApiError(404, "Tweet not found");
    }
    if ( existingTweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to update this tweet"
        );
    }
    
    const { content } = req.body
    if (!content?.trim()) {
        throw new ApiError(400, "Content is required");
    }
    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        { content: content.trim() },
        { new: true }
    )
    return res.status(200).json(
        new ApiResponse(200, updatedTweet, "Tweet updated successfully")
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params
    if (tweetId && !mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid tweet id");
    }
    const existingTweet = await Tweet.findById(tweetId)
    if (!existingTweet) {
        throw new ApiError(404, "Tweet not found");
    }
    if ( existingTweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to delete this tweet"
        );
    }
    await Tweet.findByIdAndDelete(tweetId)
    return res.status(200).json(
        new ApiResponse(200, null, "Tweet deleted successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}