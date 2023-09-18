import express from "express"
import firebase from "../firebase/config.js"    //important to initialise firebase
import IsAuthenticated from "../middleware/tokenService.js"
import {deleteMessage, getMessages, postMessage} from "../controllers/messages.js"
import multer from "multer"

const upload = multer({ storage: multer.memoryStorage() })
const router = express.Router()

//get messages
router.route("/").get(IsAuthenticated,getMessages).post(IsAuthenticated,upload.single('file'),postMessage).delete(IsAuthenticated,deleteMessage)

export default router