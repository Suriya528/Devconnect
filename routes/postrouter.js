const express=require('express')
const router=express.Router()
const {createPost,getAllPosts,getPostById,toggleLike,deletePost}=require('../controllers/postcontroller')
const { protect } = require('../middleware/authmiddleware')

router.get('/',getAllPosts)
router.get('/:id',getPostById)
router.post('/',protect,createPost)
router.put('/:id/like',protect,toggleLike)
router.delete('/:id',protect,deletePost)
module.exports=router