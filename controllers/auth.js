import User from "../models/user.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import nodemailer from "nodemailer"
import { getStorage, ref, getDownloadURL, uploadBytesResumable, deleteObject } from "firebase/storage"
import {v4} from "uuid"
// Strong password regex

export const isPasswordStrong = (password) => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return strongPasswordRegex.test(password);
  };

//Signup

export const signup = async (req, res) => {
    try {
        let { first_name, last_name, email, password, skills } = req.body
        const salt = await bcrypt.genSalt(10)
        if (password && first_name && email) {
            if(!isPasswordStrong(password)){
                return res.status(400).json({msg:"Weak Password!"})
               }
            const encryptedPassWord = await bcrypt.hash(password, salt)
            let tempUser = await User.create({
                first_name,
                last_name,
                email,
                password: encryptedPassWord,
                skills
            })
            const jwtToken = jwt.sign({ id: tempUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" })
            const link = `${process.env.BACKEND_URL}/verify/${jwtToken}`
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: `${process.env.EMAIL_ID}`,
                    pass: `${process.env.EMAIL_PASSWORD}`,
                },
                from: `Team CodeBuddy ${process.env.EMAIL_ID}`
            });
            //   console.log({link})
            const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
            <style>
                body {
                font-family: Arial, sans-serif;
                background-color: #f5f5f5;
                margin: 0;
                padding: 0;
                }
                .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                .header {
                text-align: center;
                font-size: 24px;
                color: #007bff;
                margin-bottom: 20px;
                }
                .content {
                font-size: 16px;
                color: #333;
                margin-bottom: 30px;
                }
                .button-container {
                display: flex;
                justify-content: center;
                align-items: center;
                }
                .button {
                display: inline-block;
                background: linear-gradient(135deg, #007bff 0%, #00bfff 100%);
                color: #fff;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 5px;
                transition: background 0.3s ease;
                }
                .button:hover {
                background: linear-gradient(135deg, #00bfff 0%, #007bff 100%);
                }
                .footer {
                text-align: center;
                color: #777;
                }
                a{
                    cursor : "pointer";
                }
            </style>
            </head>
            <body>
            <div class="container">
                <div class="header">Email Verification</div>
                <div class="content">
                <p>Hello,</p>
                <p>Please click the button below to verify your email address:</p>
                <div class="button-container">
                    <a href=${link} class="button">Verify Email</a>
                </div>
                <p>If you did not create an account on our website, you can ignore this email.</p>
                </div>
                <div class="footer">
                <p>Best regards,</p>
                <p>CodeBuddy Team</p>
                </div>
            </div>
            </body>
            </html>    
            `;
            const mailOptions = {
                from: `Team CodeBuddy ${process.env.EMAIL_ID}`,
                to: email,
                subject: "Verify Your Account On CodeBuddy",
                text: "Hello, this email is for your email verfication",
                html: htmlContent,
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    return res.status(400).json({ msg: "Some Error Occured!" });
                } else {
                    return res.status(201).json({ msg: "Please check your email for further validation!." })
                }
            });
        }
        else {
            return res.status(400).json({ msg: "Incomplete Details" })
        }
    } catch (error) {
        return res.status(500).json({ msg: error.message })
    }
}

export const validateUser = async (req, res) => {
    try {
        let user_id = req.params.Token
        if (!user_id) {
            return res.render('InvalidVerification', { link: process.env.FRONTEND_URL })
        }
        let { id } = jwt.verify(user_id, process.env.JWT_SECRET)
        let nonVerifiedUser = await User.findOne({ _id: id })
        if (!nonVerifiedUser) {
            return res.status(404).json({ msg: "User doesn't exist" })
        }
        if (nonVerifiedUser.isVerified) {
            return res.status(400).json({ msg: "User already exists" })
        }
        nonVerifiedUser.isVerified = true
        nonVerifiedUser.username = v4()
        await nonVerifiedUser.save()
        return res.status(200).json({ msg: "User Verified" })
    } catch (error) {
        return res.status(500).json({ error : error.message})
    }
}

//Login
export const login = async (req, res) => {
   try {
     const { email, password } = req.body;
     if (!(email && password)) {
         return res.status(400).json({msg: "Required fields can't be empty!"});
     }
     const user = await User.findOne({ email });
     if (!user) {
         return res.status(404).json({ msg: "User not found!" });
     }
     if(user.isVerified===false){
        return res.status(401).json({msg:'Verify your email first!'})
    }
     const isMatch = bcrypt.compare(password, user.password);
     if (!isMatch) {
         return res.status(400).json({ msg: "Invalid Credentials!" });
     }
     const token = jwt.sign({id: user._id }, process.env.JWT_SECRET);
     return res.status(200).cookie("Token", token, { "httpOnly": true,   sameSite:"lax",
     secure:false ,maxage:1000*60*60*24*30}).json({ msg: "Logged In Successfully!" });
 
   } catch (error) {
     return res.status(500).json({ msg: error.message });
   }
}

//Logout

export const logout = async (req, res) => {
    try {
        res.cookie("Token"," ", { "httpOnly": true,   sameSite:"lax",
        secure:false ,  expires: new Date(Date.now())}).json({ msg: "Logged Out Successfully!" });
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
}

//Forgot Password
export const forgotPassword = async (req, res) => {
   try {
     const { email } = req.body;
     const user=await User.findOne({email})
     if(!user){
         return res.status(404).json({msg:"User not found!"})
     }
     if(user.isVerified===false){
        return res.status(401).json({msg:'Verify your email first!'})
     }
     const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "5m" })
     const link = `${process.env.BACKEND_URL}/forgotPass/${jwtToken}`
     const transporter = nodemailer.createTransport({
         service: "gmail",
         auth: {
             user: `${process.env.EMAIL_ID}`,
             pass: `${process.env.EMAIL_PASSWORD}`,
         },
         from: `Team CodeBuddy ${process.env.EMAIL_ID}`
     });
     //   console.log({link})
     const htmlContent = `
     <!DOCTYPE html>
     <html lang="en">
     <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Email Verification</title>
     <style>
         body {
         font-family: Arial, sans-serif;
         background-color: #f5f5f5;
         margin: 0;
         padding: 0;
         }
         .container {
         max-width: 600px;
         margin: 0 auto;
         padding: 20px;
         background-color: #f5f5f5;
         box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
         }
         .header {
         text-align: center;
         font-size: 24px;
         color: #007bff;
         margin-bottom: 20px;
         }
         .content {
         font-size: 16px;
         color: #333;
         margin-bottom: 30px;
         }
         .button-container {
         display: flex;
         justify-content: center;
         align-items: center;
         }
         .button {
         display: inline-block;
         background: linear-gradient(135deg, #007bff 0%, #00bfff 100%);
         color: #fff;
         text-decoration: none;
         padding: 10px 20px;
         border-radius: 5px;
         transition: background 0.3s ease;
         }
         .button:hover {
         background: linear-gradient(135deg, #00bfff 0%, #007bff 100%);
         }
         .footer {
         text-align: center;
         color: #777;
         }
         a{
             cursor : "pointer";
         }
     </style>
     </head>
     <body>
     <div class="container">
         <div class="header">Reset Password</div>
         <div class="content">
         <p>Hello,</p>
         <p>Please click the button below to reset your password:</p>
         <div class="button-container">
             <a href=${link} class="button">Reset Password</a>
         </div>
         <p>If you did not create an account on our website, you can ignore this email.</p>
         </div>
         <div class="footer">
         <p>Best regards,</p>
         <p>CodeBuddy Team</p>
         </div>
     </div>
     </body>
     </html>    
     `;
     const mailOptions = {
         from: `Team CodeBuddy ${process.env.EMAIL_ID}`,
         to: email,
         subject: "Reset Your Account password On CodeBuddy",
         text: "Hello, this email is for your password reset",
         html: htmlContent,
     };
     transporter.sendMail(mailOptions, (error, info) => {
         if (error) {
             console.log(error);
             return res.status(400).json({ msg: "Some Error Occured!" });
         } else {
             return res.status(201).json({ msg: "Please check your email for further steps!." })
         }
     });
   } catch (error) {
    return res.status(500).json({ msg: error.message })
   }
}

// Change Password
export const RediectToChangePass = async (req, res) => {
    try {
        let user_id = req.params.Token
        if (!user_id) {
            return res.render('InvalidForgotReq', { link: process.env.FRONTEND_URL })
        }
        let { id } = jwt.verify(user_id, process.env.JWT_SECRET)
        let user = await User.findOne({ _id: id })
        if (!user) {
            return res.status(404).json({ msg: "User doesn't exist!" })
        }
        return res.redirect(`${process.env.FRONTEND_URL}/resetPass?Token=${user_id}`)
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
}

export const changePass=async(req,res)=>{
    try {
        let {user_id,newPassword}=req.body
        if (!user_id) {
            return res.render('InvalidForgotReq', { link: process.env.FRONTEND_URL })
        }
        let { id } = jwt.verify(user_id, process.env.JWT_SECRET)
        let user = await User.findOne({ _id: id })
        if (!user) {
            return res.status(404).json({ msg: "User doesn't exist!" })
        }
        if(!isPasswordStrong(newPassword)){
            return res.status(400).json({msg:"Weak Password!"})
           }
        const salt = await bcrypt.genSalt(10);
        const encryptedPassWord=await bcrypt.hash(newPassword,salt);
        user.password=encryptedPassWord
        await user.save()
        return res.status(200).json({msg:"Password Changed Successfully!"})
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
}

// Reset Password
export const resetPassword = async (req, res) => {
    try {
        const user=req.user;
        const {password,newPassword} = req.body;
        const salt = await bcrypt.genSalt(10);
        const encryptedPassWord=await bcrypt.hash(newPassword,salt);
        const isMatch = bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid Credentials!" });
        }
        if(!isPasswordStrong(password)){
            return res.status(400).json({msg:"Weak Password!"})
           }
        user.password = encryptedPassWord;
        await user.save();
        return res.status(200).json({ msg: "Password Changed Successfully!" });
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
}


export const setProfile = async(req,res)=>{
    try {
        const user = req.user
        const time = new Date().getTime();
        const storage = getStorage()
        const allowed_formats = ['image/png','image/jpeg']
        if(req.files){
            //profile_image
            if(req.files['profile_image']){
                if(!allowed_formats.includes(req.files['profile_image'][0].mimetype)){
                    return res.status(400).json({msg : "Only jpeg, jpg, png files are allowed"})
                }
            }
            if(req.files['profile_background']){
                if(!allowed_formats.includes(req.files['profile_background'][0].mimetype)){
                    return res.status(400).json({msg : "Only jpeg, jpg, png files are allowed"})
                }
            }
            if(req.files['profile_image']){
                if(user.profile_image!==""){
                    const fileRef = ref(storage, user.profile_image);
                    await deleteObject(fileRef)
                }
                const profile_image_storageRef = ref(storage, `profile_images/${req.files['profile_image'][0].originalname + "  " + time}`);
                const profile_image_metadata = {
                    contentType: req.files['profile_image'][0].mimetype,
                };
                const snapshot = await uploadBytesResumable(profile_image_storageRef, req.files['profile_image'][0].buffer, profile_image_metadata);
                const profile_image_downloadURL = await getDownloadURL(snapshot.ref);
                user.profile_image = profile_image_downloadURL
            }
            //profile_background
            if(req.files['profile_background']){
                if(user.profile_background!==""){
                    const fileRef = ref(storage, user.profile_background);
                    await deleteObject(fileRef)
                }
                const profile_background_storageRef = ref(storage,`profile_background/${req.files['profile_background'][0].originalname+"  "+time}`);
                const profile_background_metadata = {
                    contentType: req.files['profile_background'][0].mimetype,
                }
                const snapshot_background = await uploadBytesResumable(profile_background_storageRef, req.files['profile_background'][0].buffer, profile_background_metadata);
                user.profile_background = await getDownloadURL(snapshot_background.ref);
            }
        }   
        let {first_name, last_name, skills} = req.body
        //first_name
        if(first_name){
            user.first_name = first_name
        }
        //last_name
        if(last_name){
            user.last_name = last_name
        }
        //skills
        if(skills){
            user.skills = skills.split(' , ')
        }
        await user.save()
        return res.status(201).json({msg : "Profile Updated"})
    } catch (error) {
        return res.status(500).json({msg: error.message})
    }
}