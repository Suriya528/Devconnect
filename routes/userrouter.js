const express=require('express')
const router=express.Router()
const {protect}=require('../middleware/authmiddleware')
const {getProfile,getAllUsers,updateProfile,deleteUser}=require('../controllers/userController')
router.get('/',getAllUsers)
router.get('/profile',protect,getProfile)
router.put('/update',protect,updateProfile)
router.delete('/delete',protect,deleteUser)
module.exports=router