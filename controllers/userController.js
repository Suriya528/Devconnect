const asyncHandler = require('../middleware/asyncHandler')
const student=require('../models/user')

const getProfile=asyncHandler(async (req,res)=>{
    
        const user=await student.findById(req.user._id)
        if(!user){
             res.status(404)
             throw new Error('user not found')
        }
        res.json({
            _id:user._id,
            name:{
                firstName:user.name.firstName,
                middleName:user.name.middleName,
                lastName:user.name.lastName
            },
            email:user.email,
            role:user.role
        })


    
})

const updateProfile=asyncHandler(async(req,res)=>{
    
        const user=await student.findById(req.user._id)
        if(!user){
             res.status(404)
             throw new Error( 'user not found')
        }
        user.name=req.body.name || user.name
        user.role=req.body.role || user.role
        if(req.body.password){
            user.password=req.body.password
        }
        const update=await user.save()
        res.json({
            email:update.email,
            role:update.role

        })
    
})
const getAllUsers=asyncHandler(async(req,res)=>{
    
        const users=await student.find().select('-password')
        res.json(users)
    
})

const deleteUser=asyncHandler(async(req,res)=>{
    
        const user=await student.findById(req.user._id)
        if(!user){
             res.status(404)
             throw new Error( ' user not found')
        }
        await req.user.deleteOne()
        res.json({message:'account deleted'})
    }
   
)
const searchDevelopers=asyncHandler(async(req,res)=>{
    
        const keyword=req.query.search ?{
            $or:[
                {'name.firstName':{$regex : req.query.search,$options:'i'}},
                {'name.lastName':{$regex : req.query.search,$options:'i'}},
                {role:{$regex:req.query.search,$options:'i'}}
            ]}:{}
        const users=await student.find(keyword).select('-password')
        res.json(users)
        
    
})
module.exports={getProfile,updateProfile,getAllUsers,deleteUser,searchDevelopers}