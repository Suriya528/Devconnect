const mongoose=require('mongoose')
const bcrypt=require('bcryptjs')
const { Timestamp } = require('mongodb')
const StudentSchema=mongoose.Schema({
    name:{
        firstName:{
            type:String,
            required:true
        },
        middleName:{type:String},
        lastName:{
            type:String,
            required:true
        }
    },
    email:{type:String,required:true,unique:true},
    role:{type:String,default:'student'},
    password:{
        type:String,required:true
    }
    
},{timestamps:true})
StudentSchema.pre('save',async function(next){
    if(!this.isModified("password")) return 
    try{
const salt=await bcrypt.genSalt(10)
this.password=await bcrypt.hash(this.password,salt)

}
catch(err){
    next(err)
}
})
StudentSchema.methods.matchPassword=async function(ePassword){
    return await bcrypt.compare(ePassword,this.password)
}
module.exports=mongoose.model('Student',StudentSchema)