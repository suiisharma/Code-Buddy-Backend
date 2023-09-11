import express from "express";
import { signup, validateUser } from "../controllers/auth.js";


const router = express.Router()

router.route("/auth/signup").post(signup)
router.route("/verify/:Token").get(validateUser)
router.route("/auth/login").post()
router.route("/auth/forgotPassword").post()

export default router