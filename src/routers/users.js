const express = require("express")
const router = new express.Router()
const User = require("../models/user")
const preAuth = require("../middleware/auth")
const {sendWelcomeEmail,sendTerminationEmail} = require("../emails/account")
const multer = require("multer")
const storage = multer.memoryStorage()
const upload = multer({ 
    limits:{
        fileSize:1000000,
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpeg|jpg|png)$/)){
            return cb(new Error("Please upload an image"))
        }        
        cb(undefined,true)
    },
    storage:storage
})

// USERS SECTION

    // Upload user Avatar
    router.post("/users/me/avatar",preAuth,upload.single("avatar"),async(req,res)=>{
        try {
            req.user.avatar = req.file.buffer
            await req.user.save()
            res.status(200).send()
        } catch (error) {
            console.log(error)
            res.status(500).send()
        }
    },(error,req,res,next)=>{
        res.status(400).send({error:error.message})
    })

    // Delete user Avatar
    router.delete("/users/me/avatar",preAuth,async (req,res)=>{
        try {
            req.user.avatar = undefined
            await req.user.save()
            res.status(200).send()
        } catch (error) {
            console.log(error)
            res.status(500).send()
        }
    })
    //Display user information
    router.get("/users/me",preAuth,async (req,res)=>{
        try {
            res.send(req.user)
        } catch (error) {
            res.status(500).send()
        }
        
    })
    // Fetch user Avatar by ID
    router.get("/users/:id/avatar",async (req,res)=>{
        try {
            const user = await User.findById(req.params.id)
            if(!user||!user.avatar){
                throw new Error()
            }
            res.set("Content-Type","image/jpg")
            res.send(user.avatar)
        } catch (error) {
            res.status(404).send()
        }     
    })
        // Logout user 
    router.post("/users/logout",preAuth,async (req,res)=>{
        try {
            req.user.tokens = req.user.tokens.filter((token)=>{
                return token.token !== req.token
            })          
            await req.user.save()
            res.send()
        } catch (error) {
            console.log(error)
            res.status(500).send()
        }
    })
        // Logout all active sessions for any user
    router.post("/users/logoutAll",preAuth,async ( req,res)=>{
        try {
            req.user.tokens=[]
            await req.user.save()
            res.send()
        } catch (error) {
            res.status(500).send()
        }
    })

        // submit new user. See src/models/user.js for schema
    router.post("/users",async(req,res)=>{
        const user = new User(req.body)
        try {
            sendWelcomeEmail(user.email,user.name)
            const token = await user.generateAuthToken()
            res.status(201).send({user,token})
        } catch (error) {
            console.log(error)
            res.status(400).send(error)
        }
    })
    
        // update existing user. Must call using the user ID. Update key:value's must be in request body as an object
    router.patch("/users/me",preAuth,async (req,res)=>{
        try {
            const _id = req.user._id
            const allowedUpdates = ["name","password","age","email"]
            const attemptedUpdates = Object.keys(req.body)
            const isValidOperation = attemptedUpdates.every((key)=>allowedUpdates.includes(key))
            if(!isValidOperation){
                console.log("invalid operation")
                return res.status(400).send({error:"Attempted to update a protected field."})                
            }
            attemptedUpdates.forEach((key)=>{
                req.user[key] = req.body[key]
            })
            req.user.modifiedPaths()
            await req.user.save()
            res.send(req.user)
        } catch (error) {
            console.log(error)
            res.status(500).send()
        }
    })
        // Delete user
    router.delete("/users/me",preAuth,async (req,res)=>{
        try {
            sendTerminationEmail(req.user.email,req.user.name)
            await req.user.delete()
            res.send({removedUser:req.user})
        } catch (error) {
            console.log(error)
            res.status(500).send()
        }
    })

        // Log in an user
    router.post("/users/login",async (req,res)=>{
        try {
            const user = await User.findByCredentials(req.body.email,req.body.password)
            const token = await user.generateAuthToken()
            res.send({user,token})
        } catch (error) {
            res.status(400).send()
        }
    })
    

module.exports = router 