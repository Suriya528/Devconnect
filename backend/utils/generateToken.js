const jwt=require('jsonwebtoken')
const generateToken=(id)=>{
    console.log(process.env.JWT_SECRET)
    return jwt.sign({id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRE})

}
module.exports=generateToken