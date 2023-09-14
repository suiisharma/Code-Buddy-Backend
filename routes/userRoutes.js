import express from "express";
import { changePass, forgotPassword, login, logout, resetPassword, setProfile, signup, validateUser } from "../controllers/auth.js";
import IsAuthenticated from './../middleware/tokenService.js';
import multer from 'multer'
import firebase from "../firebase/config.js"    //important to initialise firebase

const upload = multer({ storage: multer.memoryStorage() })
const router = express.Router()

// Signup
router.route("/signup").post(signup)
router.route("/verify/:Token").get(validateUser)

// Login
router.route("/login").post(login)

// Logout
router.route("/logout").get(IsAuthenticated,logout)

// Forgot Password
router.route("/forgotPassword").post(forgotPassword)
router.route("/forgotPass/:Token").get(changePass)

// Reset Password
router.route("/resetPass").post(IsAuthenticated,resetPassword)

//profile
router.route("/profile").put(IsAuthenticated,
    upload.fields([{ name: 'profile_image', maxCount: 1 }, { name: 'profile_background', maxCount: 1 }]),
    setProfile)

export default router