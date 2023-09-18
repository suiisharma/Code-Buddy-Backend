import Comments from "../models/comments"
import Posts from "../models/posts"

export const getAllComments = async(req,res)=>{
    try {
        const comments = await Comments.find({})
        return res.status(200).json({comments})
    } catch (error) {
        return res.status(500).json({error : error.message})
    }
}

export const createComment = async(req,res)=>{
    try {
        const user = req.user
        const {post_id, replied_to, description } = req.body
        const post = await Posts.findOne({_id : post_id})
        if(!post){
            return res.status(404).json({msg : "No such post"})
        }
        if(replied_to){
            const comment = await Comments.findOne({replied_to})
            if(!comment){
                return res.status(404).json({msg : "Reply to provided comment isn't possible as it is not in the database"})
            }
        }
        if(!description){
            return res.status(400).json({msg : "No description provided"})
        }
        const comment = await Comments.create({
            commented_on_post  : post_id,
            commented_by : user._id,
            replied_to : replied_to ? replied_to : "",
            description
        })
        return res.status(201).json({msg : "Comment added successfully"})
    } catch (error) {
        return res.status(500).json({error : error.message})
    }
}

export const editComment = async(req,res)=>{
    try {
        const user = req.user
        const {comment_id, description} = req.body
        const comment = await Comments.findOne({_id: comment_id})
        if(!comment){
            return res.status(404).json({msg : "No such comment"})
        }
        if(comment.commented_by!==user._id){
            return res.status(403).json({msg : "Comment doesn't belong to user"})
        }
        if(description){
            comment.description = description
        }
        await comment.save()
        return res.status(200).json({msg : "Comment edited successfully"})
    } catch (error) {
        return res.status(500).json({error : error.message})
    }
}

export const deleteComment = async(req,res)=>{
    try {
        const user = req.user
        const {comment_id} = req.body
        const comment = await Comments.findOne({_id: comment_id})
        if(!comment){
            return res.status(404).json({msg : "No such comment"})
        }
        if(comment.commented_by!==user._id){
            return res.status(403).json({msg : "Comment doesn't belong to user"})
        }
        await Comments.deleteOne({_id : comment_id})
        return res.status(200).json({msg : "Comment deleted successfully"})
    } catch (error) {
        return res.status(500).json({error : error.message})        
    }
}
