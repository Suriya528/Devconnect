const student=require('../models/user')
const getProfile=async (req,res)=>{
    try{
        const user=await student.findById(req.user._id)
        if(!user){
            return res.status(404).json({message:'user not found'})
        }
        res.json({
            _id:user._id,
            name:{
                firstName:user.firstName,
                middleName:user.middleName,
                lastName:user.lastName
            },
            email:user.email,
            role:user.role
        })


    }
    catch(err){
        return res.status(500).json({message: err.message})

    }
}

const updateProfile=async(req,res)=>{
    try{
        const user=await student.findById(req.user._id)
        if(!user){
            return res.status(404).json({message: 'user not found'})
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
    }
    catch(err){
        res.status(500).json({message:err.message})
    }
}
const getAllUsers=async(req,res)=>{
    try{
        const users=await student.find().select('-password')
        res.json(users)
    }
    catch(err){
        return res.status(500).json({message:err.message})
    }
}

const deleteUser=async(req,res)=>{
    try{
        const user=await student.findById(req.user._id)
        if(!user){
            return res.status(404).json({message: ' user not found'})
        }
        await req.user.deleteOne()
        res.json({message:'account deleted'})
    }
    catch(err){
        return res.status(500).json({message:err.message})

    }
}
module.exports={getProfile,updateProfile,getAllUsers,deleteUser}