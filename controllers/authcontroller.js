const Student=require('../models/user')
const generateToken=require('../utils/generateToken')
const registerUser=async(req,res)=>{
    try{
        const {name,email,role,password}=req.body
        const userExists= await Student.findOne({email})
        if(userExists){
            return res.status(400).json({message:'student already exists'})
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
            password:user.password,
            token:generateToken(user._id)
        })

    }
    catch(err){
        res.status(500).json({message:err.message})

    }
}
const loginUser=async (req,res)=>{
    try{
    const {email,password}=req.body
    const user=await Student.findOne({email})
    if(!user){
        return res.status(401).json({message:'invalid username or password'})
    }
    const  isMatch=await user.matchPassword(password)
    if(!isMatch){
        return res.status(401).json({message:'invalid  password'})
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

    }
    catch(err){
        res.status(500).json({message:err.message


        })
}
}
const display=async(req,res)=>{
    
    return res.json(req.user)
}
module.exports={registerUser,loginUser,display}