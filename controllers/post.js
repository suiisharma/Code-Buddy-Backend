import Posts from "../models/posts.js";
import Comments from "../models/comments.js";
import Communities from "../models/communities.js";
import { getStorage, ref, getDownloadURL, uploadBytesResumable, deleteObject } from "firebase/storage"

const storage = getStorage()

export const getAllPosts = async(req,res)=>{
    try {
        const posts = await Posts.find({})
        return res.status(200).json({posts})
    } catch (error) {
        return res.status(500).json({error : error.message})
    }
}

export const createPost = async(req,res)=>{
    try {
        const user = req.user
        const {community_id, title, description} = req.body
        if(community_id){
            const community = await Communities.findOne({_id : community_id})
            if(!community){
                return res.status(404).json({"msg" : "Community doesn't exist"})
            }
        }
        if(!title){
            return res.status(400).json({"msg" : "Post must have a title"})
        }
        const media_paths = []
        if(req.files){
            const uploadPromises = req.files.map(async (file) => {
                const storageRef = ref(storage, `posts/${file.originalname + "  " + time}`);
                const metadata = {
                    contentType: file.mimetype,
                };
                const snapshot = await uploadBytesResumable(storageRef, file.buffer, metadata);
                const downloadURL = await getDownloadURL(snapshot.ref);
                media_paths.push(downloadURL);
            });
            await Promise.all(uploadPromises);
        }
        const post = await Posts.create({
            title,
            description : description ? description : "",
            community : community_id ? community_id : "",
            created_by : user._id,
            media_paths
        })
        return res.status(200).json({msg : "Post created successfully"})
    } catch (error) {
        return res.status(500).json({error : error.message})
    }
}

export const deletePost = async(req,res)=>{
    try {
        const user = req.user
        const {post_id} = req.body
        const post = await Posts.findOne({created_by : post_id})
        if(!post){
            return res.status(404).json({msg : "No such post"})
        }
        if(post.created_by!==user._id){
            return res.status(400).json({msg : "Post doesn't belong to the user"})
        }
        const comments = await Comments.deleteMany({commented_on_post : post_id})
        const deletePostMediaPromises = post.media_paths.map(async (path)=>{
            const fileRef = ref(storage, path);
            await deleteObject(fileRef)
        })
        await Promise.all(deletePostMediaPromises)
        await Posts.deleteOne({_id : post_id})
        return res.status(200).json({msg: "Post deleted successfully"})
    } catch (error) {
        return res.status(500).json({error : error.message})
    }
}

export const handleLikesOnPost = async(req,res)=>{
    try {
        const user = req.user
        const {post_id} = req.body
        const post = await Posts.findOne({created_by : post_id})
        if(!post){
            return res.status(404).json({msg : "No such post"})
        }
        if(post.likes[user._id]){
            post.likes[user._id] = false
        }
        else{
            post.likes[user._id] = true
        }
        return res.status(200).json({msg : "Like status changed accordingly"})
    } catch (error) {
        return res.status(500).json({error : error.message})
    }
}

