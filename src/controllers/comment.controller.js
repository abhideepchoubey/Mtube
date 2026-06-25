import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }
    const comments = await Comment.find({ video: videoId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate("owner", "fullname username avatar");
    return res.status(200).json(
        new ApiResponse(200, comments, "Video comments fetched successfully")
    )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const {content} = req.body
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }
    if (!content?.trim()) {
        throw new ApiError(400, "Content is required");
    }
    const comment = await Comment.create({
        content: content.trim(),
        owner: req.user._id,
    })
    return res.status(201).json(
        new ApiResponse(201, comment, "Comment added successfully")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {content} = req.body
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment id");
    }
    const existingComment = await Comment.findById(commentId)
    if (!existingComment) {
        throw new ApiError(404, "Comment not found");
    }
    if (existingComment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to update this comment"
        );
    }
    if (!content?.trim()) {
        throw new ApiError(400, "Content is required");
    }
    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { content: content.trim() },
        { new: true }
    )
    return res.status(200).json(
        new ApiResponse(200, updatedComment, "Comment updated successfully")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment id");
    }
    const existingComment = await Comment.findById(commentId)
    if (!existingComment) {
        throw new ApiError(404, "Comment not found");
    }
    if (existingComment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to delete this comment"
        );
    }
    await Comment.findByIdAndDelete(commentId)
    return res.status(200).json(
        new ApiResponse(200, null, "Comment deleted successfully")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
