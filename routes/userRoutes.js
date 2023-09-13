import express from "express";
import { RediectToChangePass, changePass, forgotPassword, login, logout, resetPassword, signup, validateUser } from "../controllers/auth.js";
import IsAuthenticated from './../middleware/tokenService.js';


const router = express.Router()

// Signup
router.route("/auth/signup").post(signup)
router.route("/verify/:Token").get(validateUser)

// Login
router.route("/auth/login").post(login)

// Logout
router.route("/auth/logout").get(IsAuthenticated,logout)

// Forgot Password
router.route("/auth/forgotPassword").post(forgotPassword)
router.route("/forgotPass/:Token").get(RediectToChangePass)
router.route("/auth/changePass").post(changePass)
// Reset Password
router.route("/auth/resetPass").post(IsAuthenticated,resetPassword)

export default router