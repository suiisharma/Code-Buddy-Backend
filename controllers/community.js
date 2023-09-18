import Communities from "../models/communities.js"
import { getStorage, ref, getDownloadURL, uploadBytesResumable, deleteObject } from "firebase/storage"
import Posts from "../models/posts.js"
import Comments from "../models/comments.js"

export const getAllCommunities = async(req,res)=>{
    try {
        let communities = await Communities.find({})
        return res.status(200).json({communities})
    } catch (error) {
        return res.status(500).json({error : error.message})
    }
}

export const joinCommunity = async(req,res)=>{
    try {
        const user = req.user
        const {community_id} = req.body
        if(!community_id){
            return res.status(400).json({msg : "No community provided"})
        }
        const community = await Communities.find({_id : community_id})
        if(!community){
            return res.status(404).json({msg : "No such community"})
        }
        if(community.members.includes(user._id)){
            return res.status(400).json({msg : "User already part of the community"})
        }
        community.members.push(user._id)
        await community.save()
    } catch (error) {
        return res.status(500).json({error : error.message})
    }
}

export const leaveCommunity = async(req,res)=>{
    try {
        const user = req.user
        const {community_id} = req.body
        if(!community_id){
            return res.status(400).json({msg : "No community provided"})
        }
        const community = await Communities.find({_id : community_id})
        if(!community){
            return res.status(404).json({msg : "No such community"})
        }
        if(!community.members.includes(user._id)){
            return res.status(400).json({msg : "User not part of the community"})
        }
        community.members.pull(user._id)    //doubtful
        await community.save()
    } catch (error) {
        return res.status(500).json({error : error.message})
    }
}

export const createCommunity = async(req,res)=>{
    try {
        const user = req.user
        const {name,description} = req.body
        const time = new Date().getTime();
        const storage = getStorage()
        const allowed_formats = ['image/png','image/jpeg']
        let community_logo_downloadURL = ""
        if(req.file){
            if(!allowed_formats.includes(req.file.mimetype)){
                return res.status(400).json({msg : "Only jpeg, jpg, png files are allowed"})
            }
            const community_logo_storageRef = ref(storage, `community_logos/${req.file.originalname + "  " + time}`);
            const community_logo_metadata = {
                contentType: req.file.mimetype,
            };
            const snapshot = await uploadBytesResumable(community_logo_storageRef, req.file.buffer, community_logo_metadata);
            community_logo_downloadURL = await getDownloadURL(snapshot.ref);
        }
        const community = await Communities.create({
            name,
            logo:community_logo_downloadURL,
            description,
            created_by : user._id
        })
        return res.status(201).json({msg : "Community created successfully"})
    } catch (error) {
        return res.status(500).json({error : error.message})
    }
}

export const editCommunity = async(req,res)=>{
    try {
        let user = req.user
        let {community_id,name,description} = req.body
        const community = await Communities.findOne({_id:community_id})
        if(!community){
            return res.status(404).json({msg : "No such community"})
        }
        if(community.created_by!==user._id){
            return res.status(403).json({msg: "Community not created by the user"})
        }
        const time = new Date().getTime();
        const storage = getStorage()
        const allowed_formats = ['image/png','image/jpeg']
        let community_logo_downloadURL = ""
        if(community.logo==="" && req.file){
            if(!allowed_formats.includes(req.file.mimetype)){
                return res.status(400).json({msg : "Only jpeg, jpg, png files are allowed"})
            }
            const community_logo_storageRef = ref(storage, `community_logos/${req.file.originalname + "  " + time}`);
            const community_logo_metadata = {
                contentType: req.file.mimetype,
            };
            const snapshot = await uploadBytesResumable(community_logo_storageRef, req.file.buffer, community_logo_metadata);
            community_logo_downloadURL = await getDownloadURL(snapshot.ref);
        }
        else if(community.logo!=="" && req.file){
            if(!allowed_formats.includes(req.file.mimetype)){
                return res.status(400).json({msg : "Only jpeg, jpg, png files are allowed"})
            }
            const fileRef = ref(storage, community.logo);
            await deleteObject(fileRef)
            const community_logo_storageRef = ref(storage, `community_logos/${req.file.originalname + "  " + time}`);
            const community_logo_metadata = {
                contentType: req.file.mimetype,
            };
            const snapshot = await uploadBytesResumable(community_logo_storageRef, req.file.buffer, community_logo_metadata);
            community_logo_downloadURL = await getDownloadURL(snapshot.ref);
        }
        if(name){
            community.name = name
        }
        if(description){
            community.description = description
        }
        community.logo = community_logo_downloadURL
        await community.save()
        return res.status(200).json({msg : "Community edited successfully"})
    } catch (error) {
        return res.status(500).json({error : error.message})
    }
}

export const deleteCommunity = async(req,res)=>{
    try {
       const user = req.user
       const {community_id}  = req.body
       const community = await Communities.findOne({_id : community_id})
       if(!community){
            return res.status(404).json({msg : "Community doesn't exist"})
       }
       if(community.created_by!==user._id){
            return res.status(403).json({msg : "Community doesn't belong to the user"})
       }
       const postsInCommunity = await Posts.find({community : community_id})
       const postsIds = postsInCommunity.map(post => post._id);
       await Comments.deleteMany({ commented_on_post: { $in: postsIds } });
       await Posts.deleteMany({_id : { $in : postsIds}})
       await Communities.deleteOne({_id : community._id})
       return res.status(200).json({msg : "Community deleted successfully"})
    } catch (error) {
        return res.status(500).json({error : error.message})
    }
}

