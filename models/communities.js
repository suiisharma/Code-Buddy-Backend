import mongoose from "mongoose";

const CommunitySchema = new mongoose.Schema({
        created_by : {
            type : String,
            required : true
        },
        members : {
            type : Array,
            default : []
        },
        isPublic : {
            type: Boolean,
            default : true
        },
        name : {
            type : String,
            required : true
        },
        logo : {
            type : String,
            default : ""
        },
        description : {
            type : String,
            default : ""
        }
    },
    {timestamps : true}
)

export default mongoose.model("Communities",CommunitySchema)