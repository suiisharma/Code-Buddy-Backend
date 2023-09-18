import express from "express";
import IsAuthenticated from './../middleware/tokenService.js';
import multer from 'multer'
import firebase from "../firebase/config.js"    //important to initialise firebase
import { createPost, deletePost, getAllPosts, handleLikesOnPost } from "../controllers/post.js";

const upload = multer({ storage: multer.memoryStorage() })
const router = express.Router()

//get posts
router.route("/").get(getAllPosts)

//create posts
router.route("/").post(IsAuthenticated,upload.array('media'),createPost)

//delete post
router.route("/").delete(IsAuthenticated,deletePost)

//likes on post
router.route("/likes").put(IsAuthenticated,handleLikesOnPost)

export default router