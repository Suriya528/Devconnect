const Student=require('../models/user')
const asyncHandler=require('../middleware/asyncHandler')
const generateToken=require('../utils/generateToken')
const registerUser=asyncHandler(async(req,res)=>{
    
        const {name,email,role,password}=req.body
        const userExists= await Student.findOne({email})
        if(userExists){
             res.status(400)
            throw new Error('student already exists')
        }
        
        const user=await Student.create({name,email,role,password})
        res.status(201).json({
            _id:user._id,
            name:{
                firstName:user.name.firstName,
                middleName:user.name.middleName,
                lastName:user.name.lastName
            },
            email:user.email,
            role:user.role,
            token:generateToken(user._id)
        })

    
    
})
const loginUser=asyncHandler(async (req,res)=>{
    
    const {email,password}=req.body
    const user=await Student.findOne({email})
    if(!user){
         res.status(401)
         throw new Error('invalid username or password')
    }
    const  isMatch=await user.matchPassword(password)
    if(!isMatch){
         res.status(401)
         throw new Error('invalid username or  password')
    }
    res.status(200).json({
            _id:user._id,
            name:{
                firstName:user.name.firstName,
                middleName:user.name.middleName,
                lastName:user.name.lastName
            },
            email:user.email,
            role:user.role,
            
            token:generateToken(user._id)
        })

    
})
const display=asyncHandler(async(req,res)=>{
    
     res.json(req.user)
})
module.exports={registerUser,loginUser,display}