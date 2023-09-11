import User from "../models/user.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import nodemailer from "nodemailer"

const signup = async (req, res) => {
    try {
        let { first_name, last_name, email, password, skills } = req.body
        const salt = await bcrypt.genSalt()
        if (password && first_name && last_name && email) {
            const encryptedPassWord = await bcrypt.hash(password, salt)
            let tempUser = await User.create({
                first_name,
                last_name,
                email,
                password: encryptedPassWord,
                skills
            })
            const jwt = jwt.sign({id:tempUser._id},process.env.JWT_SECRET,{expiresIn:"1h"})
            const link = `${process.env.BACKEND_URL}/verify/${jwt}`
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                  user: `${process.env.EMAIL_ID}`,
                  pass: `${process.env.EMAIL_PASSWORD}`,
                },
                from : `${process.env.EMAIL_ID}`
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
                <p>TaskTonic Team</p>
                </div>
            </div>
            </body>
            </html>    
            `;
            const mailOptions = {
                from: `${process.env.EMAIL_ID}`,
                to: email,
                subject: "Verify Your Account On CodeBuddy",
                text : "Hello, this email is for your email verfication",
                html: htmlContent,
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.log(error);
                  return res.status(400).json({msg : "Some Error Occured!"});
                } else {
                  return  res.status(201).json({msg : "Please check your email for further validation!."})
                }
              });
        }
        else {
            return res.status(400).json({ msg: "Incomplete Details" })
        }
    } catch (error) {
        return res.status(500).json({msg : error.message})
    }
}

const validateUser = async(req,res)=>{
    try {
        let user_id = req.params.Token
        if(!user_id){
            return res.render('InvalidVerification',{link:process.env.FRONTEND_URL})
        }
        let {id} = jwt.verify(user_id,process.env.JWT_SECRET)
        let nonVerifiedUser = await User.findOne({_id:id})
        if(!nonVerifiedUser){
            return res.status(404).json({msg : "User doesn't exist"})
        }
        if(nonVerifiedUser.isVerified){
            return res.status(400).json({msg:"User already exists"})
        }
        nonVerifiedUser.isVerified = true
        await nonVerifiedUser.save()
        return res.status(200).json({msg:"User Verified"})
    } catch (error) {
        return res.status(500).json({error})
    }
}

export {validateUser,signup}