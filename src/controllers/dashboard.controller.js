import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const channelId = req.user._id;
 
    // const totalVideos = await Video.countDocuments({ owner: channelId });
    // const totalSubscribers = await Subscription.countDocuments({ channel: channelId });
    // const totalLikes = await Like.countDocuments({ video: { $in: await Video.find({ owner: channelId }).distinct("_id") } });
    
    //optimized query
    const [statsResult, totalSubscribers] = await Promise.all([
        Video.aggregate([
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(channelId)
                }
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "video",
                    as: "likes"
                }
            },
            {
                $group: {
                    _id: "$owner",

                    totalVideos: {
                        $sum: 1
                    },

                    totalViews: {
                        $sum: "$views"
                    },

                    totalLikes: {
                        $sum: {
                            $size: "$likes"
                        }
                    }
                }
            }
        ]),

        Subscription.countDocuments({
            channel: channelId
        })
    ]);

    const stats = {
        totalVideos: statsResult[0]?.totalVideos || 0,
        totalSubscribers,
        totalLikes: statsResult[0]?.totalLikes || 0,
        totalViews: statsResult[0]?.totalViews || 0
    };
    const channel = await User.findById(channelId)
    .select("fullname username avatar");

    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }
    const channelStats = {
        channel: {
            _id: channel._id,
            fullname: channel.fullname,
            username: channel.username,
            avatar: channel.avatar
        },
        stats
    };
    return res.status(200).json(
        new ApiResponse(200, channelStats, "Channel stats fetched successfully")
    );
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const channelId = req.user._id;

    const { page = 1, limit = 10 } = req.query;

    const videos = await Video.find({
        owner: channelId
    })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    return res.status(200).json(
        new ApiResponse(
            200,
            videos,
            "Channel videos fetched successfully"
        )
    );
});

export {
    getChannelStats, 
    getChannelVideos
    }