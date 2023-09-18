import mongoose from "mongoose";

const messagesSchema = new mongoose.Schema({
    sent_to : {
        type : String,
        required : true
    },
    received_by : {
        type : String,
        required : true
    },
    content : {
        type : String,
        default : ""
    },
    file : {
        type : String,
        default : ""
    }
},
{timestamps : true})

export default mongoose.model('messages', messagesSchema)