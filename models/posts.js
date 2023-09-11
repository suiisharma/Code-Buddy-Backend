import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
        created_by : {
            type :  String,
            required : true
        },
        title : {
            type : String,
            required : true
        },
        media_paths : {
            type : Array,
            default : []
        },
        description : {
            type :  String,
            required : false,
            default : ""
        },
        likes : {
            type : Map,
            of : Boolean
        },
        comments : {
            type : Array,
            default : []
        },
        community : {
            type : String,
            default : "",
            required : false
        }
    },
    {timestamps : true}
)

export default mongoose.model("Post",PostSchema)