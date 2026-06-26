const student=require('../models/user')
const jwt=require('jsonwebtoken')
const protect=async(req,res,next)=>{
    console.log(req.headers.authorization)
    let token
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        
        try{
            token=req.headers.authorization.split(' ')[1]
            const decoded=jwt.verify(token,process.env.JWT_SECRET)
            console.log(decoded)
            req.user=await student.findById(decoded.id).select('-password')
            console.log(req.user)
            return next()
        }
        catch(err){
            console.log(err)
            return res.status(401).json({message:'not authorized,token failed'})
        }

    }
    if(!token){
        return res.status(401).json({message:'not authorized,no token'})
    }
}
module.exports={protect}