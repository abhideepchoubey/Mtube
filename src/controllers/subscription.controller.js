import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channel id");
    }
    const channel = await User.findById(channelId)
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    })

    if (existingSubscription) {
        await Subscription.findByIdAndDelete(existingSubscription._id)
        return res.status(200).json(
            new ApiResponse(
                200,
                null,
                "Unsubscribed from channel successfully"
            )
        )
    }
    const newSubscription = await Subscription.create({
        subscriber: req.user._id,
        channel: channelId
    })
    return res.status(201).json(
        new ApiResponse(
            201,
            newSubscription,
            "Subscribed to channel successfully"
        )
    )
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channel id");
    }
    const subscribers = await Subscription.find({ channel: channelId })
        .populate("subscriber", "fullname username avatar");
    return res.status(200).json(
        new ApiResponse(200, subscribers, "Channel subscribers fetched successfully")
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!mongoose.Types.ObjectId.isValid(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber id");
    }
    const subscribedChannels = await Subscription.find({ subscriber: subscriberId })
        .populate("channel", "fullname username avatar");
    return res.status(200).json(
        new ApiResponse(200, subscribedChannels, "Subscribed channels fetched successfully")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}