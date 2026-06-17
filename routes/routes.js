const express=require('express')
const router=express.Router()
const Student=require('../models/user')

router.post('/', async(req,res)=>{
    try{
    const newuser=await Student.create(req.body)
    res.status(201).json(newuser)
    }
    catch(err){
        res.status(500).json({message:err.message})
    
}})
router.get('/',async(req,res)=>{
    try{
        const students= await Student.find()
        res.status(200).json(students)
    }
    catch(err){
        res.status(500).json({message:err.message})
}})
router.get('/:id',async(req,res)=>{
    try{
    const user=await Student.findById(req.params.id)
    res.status(200).json(user)
}
catch(err){
    res.status(500).json({message:err.message})
}
})
router.put('/:id',async(req,res)=>{
    try{
        const updatevalue=await Student.findByIdAndUpdate(req.params.id,req.body,{new:true})
        res.status(200).json(updatevalue)
    }
    catch(err){
        res.status(500).json({message:err.message})
    }

})
router.delete('/:id',async(req,res)=>{
    try{
        const removed= await Student.findByIdAndDelete(req.params.id)
        res.status(200).json('removed')
    }
    catch(err){
        res.status(500).json({message:err.message})
    }
})
module.exports=router