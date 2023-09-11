import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
        first_name : {
            type : String,
            required : true,
            min: 1,
            max : 30
        },
        last_name : {
            type : String,
            min: 0,
            max : 30,
            default : ""
        },
        email : {
            type : String,
            required : true,
            unique : true,
            max : 37
        },
        password : {
            type : String,
            required : true,
            min : 8
        },
        profile_image : {
            type : String,
            default : "",
        },
        profile_background : {
            type : String,
            default : ""
        },
        isVerified : {
            type : Boolean,
            default : false
        },
        communities_joined : {
            type : Array,
            default : []
        },
        skills : {
            type : Array,
            default : []
        }
    },
    {timestamps : true}
)

export default mongoose.model('User', userSchema)