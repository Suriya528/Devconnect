const post = require('../models/post')
const Post=require('../models/post')
const createPost=async(req,res)=>{
    try{
    const cPost=await post.create({
        name:req.user._id,
        text:req.body.text
    })
    const populatePost=await cPost.populate('name','name role')
    res.status(201).json(populatePost)

}
catch(err){
    res.status(400).json({message:err.message})

}
}
const getAllPosts=async(req,res)=>{
    try{
    const posts=await post.find().populate('name','name role').sort({createdAt: -1})
    res.json(posts)
    }
    catch(err){
        res.status(500).json({message:err.message})
    }
}
const getPostById=async(req,res)=>{
    try{
        const postdta=post.findById(req.params.id).populate('name','name role')
        if(!post){
            return res.status(404).json({message:'user not found'})

        }
        res.json(postdta)

    }
    catch(err){
        res.status(500).status({message:err.message})
    }
}
const toggleLike=async(req,res)=>{
    try{
    const postdta=await Post.findById(req.params.id)
    if(!postdta){
        return res.status(404).json({message:'user not found'})
    }
    const alreadyLiked=postdta.likes.includes(req.user._id)
    if(alreadyLiked){
        post.likes=postdta.likes.filter((id)=>id.toString()!==req.user._id.toString())
    }
    else{
        postdta.likes.push(req.user._id)
    }
    await postdta.save()
    res.json({likescount:postdta.likes.length,likes:postdta.likes})
}
catch(err){
    res.status(500).json({message:err.message})
}
}
const deletePost=async(req,res)=>{
    try{
        const postdta=await Post.findById(req.params.id)
        if(!postdta){
            return res.status(404).json({message:'user not found'})
        }
        if(postdta.name.toString()!==req.user._id.toString()){
            return res.status(403).json({message:'not authorized to delete'})
        }
        await Post.findByIdAndDelete(req.params.id)
        res.json({message:'user deleted successfully'})

    }
    catch(err){
        res.status(500).json({message:err.message})
    }
}
module.exports={createPost,getAllPosts,getPostById,toggleLike,deletePost}