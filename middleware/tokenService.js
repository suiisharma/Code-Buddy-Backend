import jwt from "jsonwebtoken";
import User from "../models/user.js";



const IsAuthenticated=async(req,res,next)=>{
    try {
        
        const {Token}=req.cookies;
        if(!Token){
          return   res.status(401).json({msg:'Login first!'})
        }
        const decodeData=jwt.verify(Token,process.env.JWT_SECRET);
        const user= await User.findById({_id:decodeData.id});
        if(!user){
            return res.status(400).json({msg:'Some error occured !'})
        }
        if(user.isVerified===false){
            return res.status(401).json({msg:'Verify your email first!'})
        }
        req.user=user
        next()
    } catch (error) {
        res.status(401).json({msg:error.message})
    }
}


export default IsAuthenticated