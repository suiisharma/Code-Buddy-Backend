import Messages from "../models/messages"
import Users from "../models/user"
import { getStorage, ref, getDownloadURL, uploadBytesResumable, deleteObject } from "firebase/storage"

const storage = getStorage()

export const getMessages = async(req,res)=>{
    try {
        let messagesOfUser = await Messages.find({ $or: [
            { sent_by: req.user._id },
            { received_by: req.user._id }
          ]})
        return res.status(200).json({messages : messagesOfUser})
    } catch (error) {
        return res.status(500).json({error : error.message})
    }
}

export const postMessage = async(req,res)=>{
    try {
        const user = req.user
        const {received_by, content}  = req.body
        if(!req.file && !content){
            return res.status(400).json({msg : "Message must have content or file"})
        }
        const receiver = await Users.findOne({_id : user.id})
        let message_downloadURL = ""
        if(!receiver){
            return res.status(404).json({msg : "Such user doesn't exist"})
        }
        if(req.file){
            const storage_ref = ref(storage, `messages/${req.file.originalname + "  " + time}`);
            const metadata = {
                contentType: req.file.mimetype,
            };
            const snapshot = await uploadBytesResumable(storage_ref, req.file.buffer, metadata);
            message_downloadURL = await getDownloadURL(snapshot.ref);
        }
        const message = await Messages.create({
            sent_by : user.id,
            received_by,
            content : content ? content : "",
            file : message_downloadURL
        })
        return res.status(201).json({msg : "Message created successfully"})
    } catch (error) {
        return res.status(500).json({error : error.message})
    }
}

export const deleteMessage = async(req,res)=>{
    try {
        let user = req.user
        let {message_id} = req.body
        let message = await Messages.findOne(({_id : message_id}))
        if(!message){
            return res.status(404).json({msg : "No such message"})
        }
        if(user._id !== message.sent_by && user._id !== message.received_by){
            return res.status(403).json({msg : "Message doesn't exist to user"})
        }
        if(req.file!==""){
            const fileRef = ref(storage, message.file);
            await deleteObject(fileRef)        
        }
        await Messages.deleteOne({_id : message_id})
        return res.status(200).json({msg : "Message deleted successfully"})
    } catch (error) {
        return res.status(500).json({error : error.message})
    }
}