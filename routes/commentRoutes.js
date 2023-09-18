import express from "express";
import IsAuthenticated from './../middleware/tokenService.js';
import { createComment, deleteComment, editComment, getAllComments } from "../controllers/comment.js";

const router = express.Router()

//get comments
router.route("/").get(getAllComments)

//create posts
router.route("/").post(IsAuthenticated,createComment)

//edit put
router.route("/").put(IsAuthenticated,editComment)

//delete post
router.route("/").delete(IsAuthenticated,deleteComment)


export default router