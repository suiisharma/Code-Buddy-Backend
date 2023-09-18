import express from "express";
import IsAuthenticated from './../middleware/tokenService.js';
import multer from 'multer'
import firebase from "../firebase/config.js"    //important to initialise firebase
import { createCommunity, deleteCommunity, editCommunity, getAllCommunities, joinCommunity, leaveCommunity } from "../controllers/community.js";

const upload = multer({ storage: multer.memoryStorage() })
const router = express.Router()

//get communities
router.route("/").get(getAllCommunities)

//create posts
router.route("/").post(IsAuthenticated,upload.single('logo'),createCommunity)

//edit posts
router.route("/").put(IsAuthenticated,upload.single('logo'),editCommunity)

//delete post
router.route("/").delete(IsAuthenticated,deleteCommunity)

//join community
router.route("/").put(IsAuthenticated,joinCommunity)

//leave community
router.route("/").put(IsAuthenticated,leaveCommunity)
