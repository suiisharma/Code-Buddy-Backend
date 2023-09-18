import firebase from "../firebase/config.js"    //important to initialise firebase
import IsAuthenticated from "../middleware/tokenService.js"
import {deleteMessage, getMessages, postMessage} from "../controllers/messages.js"

const upload = multer({ storage: multer.memoryStorage() })
const router = express.Router()

//get messages
router.router("/").get(IsAuthenticated,getMessages).post(IsAuthenticated,upload.single('file'),postMessage).delete(IsAuthenticated,deleteMessage)

export default router