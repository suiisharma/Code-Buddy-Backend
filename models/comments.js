import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
        commented_on_post : {
            type : String,
            required : true
        },
        replied_to : {
            type : String,
            required : false,
            default : ""
        },
        description : {
            type : String,
            required : true
        }
    },
    {timestamps : true}
)

export default mongoose.model("Comments", CommentSchema)