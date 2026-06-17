const express=require('express')
const router=express.Router()
let users=[
    {
        id:1,name:'suriya',age:21,role:'full stack developer'
    },{
        id:2,name:'mohan',age:22,role:'backebd developer'
    }
]
router.get('/',(req,res)=>{
    res.json(users)
})
router.post('/',(req,res)=>{
    const newuser={
        id:users.length+1,
        name:req.body.name,
        age:req.body.age,
        role:req.body.role
    }
    users.push(newuser)
    res.status(201).json(newuser)
})
router.put('/:id',(req,res)=>{
    console.log(req.params.id)
    const user=users.find(u=>u.id===parseInt(req.params.id))
    if(!user)
        return res.status(404).json({message:'user not found'})
    const {name,age,role}=req.body
    user.name=name
    user.age=age
    user.role=role
    res.json(user)

})
router.delete('/:id',(req,res)=>{
    users=users.filter(
        u=>u.id!==parseInt(req.params.id)
    )
    res.json({message:'id deleted successfully'})
})
module.exports=router