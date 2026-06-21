const express=require('express')
const router=express.Router()
const {registerUser,loginUser,display}=require('../controllers/authcontroller')
const {protect}=require('../middleware/authmiddleware')
router.post('/register',registerUser)
router.post('/login',loginUser)
router.get('/view',protect,display)


module.exports=router