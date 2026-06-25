const asyncHandler=require('../middleware/asyncHandler')
const Post=require('../models/post')
const createPost=asyncHandler(async(req,res)=>{
    if(!req.body.text?.trim()){
    res.status(400)
    throw new Error('Post text is required')
}
    
    const cPost=await Post.create({
        name:req.user._id,
        text:req.body.text
    })
    
    const populatePost=await cPost.populate('name','name role')
    res.status(201).json(populatePost)

})
const getAllPosts=asyncHandler(async(req,res)=>{
    
    const posts=await Post.find().populate('name','name role').sort({createdAt: -1})
    res.json(posts)
    
    
})
const getPostById=asyncHandler(async(req,res)=>{
    
        const postdta=await Post.findById(req.params.id).populate('name','name role')
        if(!postdta){
             res.status(404)
             throw new Error('Post not found')

        }
        res.json(postdta)

    
})
const toggleLike=asyncHandler(async(req,res)=>{
    
    const postdta=await Post.findById(req.params.id)
    if(!postdta){
         res.status(404)
         throw new Error('user not found')
    }
    const alreadyLiked=postdta.likes.includes(req.user._id)
    if(alreadyLiked){
        postdta.likes=postdta.likes.filter((id)=>id.toString()!== req.user._id.toString())
    }
    else{
        postdta.likes.push(req.user._id)
    }
    await postdta.save()
    res.json({likescount:postdta.likes.length,likes:postdta.likes})

})
const deletePost=asyncHandler(async(req,res)=>{
    
        const postdta=await Post.findById(req.params.id)
        if(!postdta){
             res.status(404)
             throw new Error('user not found')
        }
        if(postdta.name.toString()!==req.user._id.toString()){
             res.status(403)
             throw new Error('not authorized to delete')
        }
        await Post.findByIdAndDelete(req.params.id)
        res.json({message:'user deleted successfully'})

    
    
})
const createComment=asyncHandler(async(req,res)=>{

    const postdta=await Post.findById(req.params.id)
    if(!postdta){
         res.status(404)
         throw new Error( 'post not found')
    }
    if(!req.body.text?.trim()){
    res.status(400)
    throw new Error('Comment text is required')
}
    const comment={
        name:req.user._id,
        text:req.body.text
    }
    
    postdta.comments.push(comment)
    await postdta.save()
    const updatedComment= await Post.findById(req.params.id).populate('name','name role').populate('comments.name','name role')
    res.status(201).json(updatedComment.comments)

})

const deleteComment=asyncHandler(async(req,res)=>{

        const postdta=await Post.findById(req.params.id)
        if(!postdta){
             res.status(404)
             throw new Error( 'Post not found')
        }
        const comment=postdta.comments.find((C)=> C._id.toString()===req.params.commentId)
        if(!comment){
             res.status(404)
             throw new Error('comment not found')
        }
        if(comment.name.toString()!==req.user._id.toString()){
             res.status(403)
             throw new Error( 'not authorized to delete')
        }
        postdta.comments=postdta.comments.filter((c)=>c._id.toString()!==req.params.commentId)
        await postdta.save()
        res.json({message:'comment deleted successfully'})

    
})

module.exports={createPost,getAllPosts,getPostById,toggleLike,deletePost,createComment,deleteComment}