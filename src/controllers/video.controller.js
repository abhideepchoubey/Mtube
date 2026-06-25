import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user id");
    }
    
    const filter = {};
    if (query) {
        filter.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
        ];
    }
    if (userId) {
        filter.owner = new mongoose.Types.ObjectId(userId);
    }

    const videos = await Video.find(filter)
        .sort({ [sortBy]: sortType === "desc" ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate("owner", "fullname username avatar");

    return res.status(200).json(
        new ApiResponse(
            200,
            videos,
            "Videos fetched successfully"
        )
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if (!title?.trim()) {
        throw new ApiError(400, "Title is required");
    }

    if (!description?.trim()) {
        throw new ApiError(400, "Description is required");
    }
    // console.log(req.files)
    const videoLocalPath = req.files?.videoFile?.[0]?.path
    if(!videoLocalPath){
        throw new ApiError(400,"Video file is missing")
    }
    const videoFile = await uploadOnCloudinary(videoLocalPath)
    if(!videoFile?.url){
        throw new ApiError(400,"Error while uploading the Video")
    }
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path
    if(!thumbnailLocalPath){
        throw new ApiError(400,"Thumbnail file is missing")
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if(!thumbnail?.url){
        throw new ApiError(400,"Error while uploading the thumbnail")
    }
    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title:title.trim(),
        description:description.trim(),
        owner: req.user._id,
        duration: videoFile.duration
    })
    // const createdVideo = await Video.findById(video._id)

    // if(!createdVideo) {
    //     throw new ApiError(500 ,"Something went wrong while uploading a video")
    // }

    return res.status(201).json(
        new ApiResponse(201, video ,"Video uploaded successfully")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get videoLocalPath by id
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }
    // const video = await Video.aggregate([
    //     {
    //         $match:{
    //             _id:new mongoose.Types.ObjectId(videoId)
    //         }
    //     },
    //     {
    //         $project:{
    //             videoFile: 1,
    //             thumbnail: 1,

    //             title: 1,
    //             description:1,
    //             owner: 1,
    //             duration: 1
    //         }
    //     }
    // ])
    // if(!video?.length){
    //     throw new ApiError(404,"Video doesn't exists")
    // }
    // return res
    // .status(200)
    // .json(
    //     new ApiResponse(
    //         200,
    //         video[0],
    //         "Video fetched Successfully")
    // )
    const video = await Video.findById(videoId)
    .populate("owner", "fullname username avatar");
    if (!video) {
        throw new ApiError(404, "Video doesn't exist");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "Video fetched successfully"
        )
    )
})


const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: update videoLocalPath details like title, description, thumbnail
    const { title, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const existingVideo = await Video.findById(videoId);

    if (!existingVideo) {
        throw new ApiError(404, "Video doesn't exist");
    }

    // Verify ownership
    if ( existingVideo.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to update this video"
        );
    }

    let thumbnailUrl = existingVideo.thumbnail;

    const thumbnailLocalPath = req.file?.path;

    if (thumbnailLocalPath) {
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

        if (!thumbnail?.url) {
            throw new ApiError(
                400,
                "Error while uploading thumbnail"
            );
        }

        thumbnailUrl = thumbnail.url;

        // Delete old thumbnail
        if (existingVideo.thumbnail) {
            const publicId = getPublicIdFromUrl(
                existingVideo.thumbnail
            );

            await deleteFromCloudinary(publicId);
        }
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title: title?.trim() || existingVideo.title,
                description: description?.trim() || existingVideo.description,
                thumbnail: thumbnailUrl,
                },
        },
        {
            new: true,
        }
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedVideo,
            "Video updated successfully"
        )
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete videoLocalPath
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }
    const video = await Video.findById(videoId);
    const user = await User.findById(req.user._id);

    if (!video) {
        throw new ApiError(404, "Video doesn't exist");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video");
    }

    // Delete video from Cloudinary
    const publicId = getPublicIdFromUrl(video.videoFile);
    await deleteFromCloudinary(publicId);

    // Delete thumbnail from Cloudinary
    if (video.thumbnail) {
        const thumbnailPublicId = getPublicIdFromUrl(video.thumbnail);
        await deleteFromCloudinary(thumbnailPublicId);
    }

    // Delete video document from MongoDB
    await Video.findByIdAndDelete(videoId);

    return res.status(200).json(
        new ApiResponse(200, null, "Video deleted successfully")
    );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }
    const video = await Video.findById(videoId);
    const user = await User.findById(req.user._id);

    if (!video) {
        throw new ApiError(404, "Video doesn't exist");
    }   

    if( video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to change the publish status of this video");
    }

    video.isPublished = !video.isPublished;
    await video.save();

    return res.status(200).json(
        new ApiResponse(200, video, `Video ${video.isPublished ? 'published' : 'unpublished'} successfully`)
    );

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}