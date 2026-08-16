const express=require('express')
const router=express.Router()
const {registerUser,loginUser,display,githubLogin}=require('../controllers/authcontroller')
const {protect}=require('../middleware/authmiddleware')
router.post('/register',registerUser)
router.post('/login',loginUser)
router.post('/github',githubLogin)
router.get('/view',protect,display)


module.exports=router