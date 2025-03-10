import express from 'express';
import multer from 'multer';
import { createPost, getAllUserPosts } from '../Controller/postController.js';
const storage = multer.memoryStorage();
const upload = multer({ storage });


const router = express.Router();


router.route("/create-post/:userId").post(upload.single('image'),createPost)
router.route("/get-user-posts/:userId").get(getAllUserPosts)





export default router


