const express = require("express")
const router = new express.Router()
const Task = require("../models/task")
const User = require("../models/user")
const preAuth = require("../middleware/auth")

    // list all tasks. 
    // /tasks?completed=true to get only completed tasks
    // /tasks?completed=false to get only incomplete tasks
    // /tasks?sortBy=createdAt:desc
    // /tasks to get all tasks.
    // ?limit=x and ?skip=x can be added to the url query for pagination purposes
    router.get("/tasks",preAuth,async (req,res)=>{
        try{
            match = {}
            sort = {}
            if(req.query.completed){
                match.completed = req.query.completed ==="true"
            }
            if(req.query.sortBy){
                const parts = req.query.sortBy.split(":")
                sort[parts[0]] = parts[1] === "desc" ? -1 : 1
            }
            await req.user.populate({
                path:"tasks",
                match,
                options:{
                    limit:parseInt(req.query.limit),
                    skip:parseInt(req.query.skip),
                    sort
                }
            })
            res.send(req.user.tasks)
        } catch(error) {
            console.log(error)
            res.status(500).send()      
        }
    })
        // find task by ID
    router.get("/tasks/:id",preAuth,async (req,res)=>{
        const _id = req.params.id
        try {
            const task = await Task.findOne({_id,owner:req.user._id})
            if(!task){
                return res.status(404).send()
            }
            res.send(task)
        } catch (error) {
            res.status(500).send()
        }
    })
        // submit new task. See src/models/task.js for schema
    router.post("/tasks",preAuth,async (req,res)=>{
        const task = new Task({
            ...req.body,
            owner:req.user._id
        })
        try {
            await task.save()
            res.send(task)
        } catch (error) {
            res.status(500).send(error)
        }
    
    })
        // delete task by ID
    router.delete("/tasks/:id",preAuth,async (req,res)=>{
        const _id = req.params.id
        try {
            const task = await Task.findOneAndDelete({_id,owner:req.user._id})

            if(!task){
                return res.status(404).send()
            }
            const count = await Task.countDocuments({owner:req.user._id})
            res.send("Task removed : "+task+"\n Leftover tasks: " + count)   
        } catch (error) {
            res.status(500).send()
        } 
    })
        // update existing task. Must call using the task ID. Update key:value's must be in request body as an object
    router.patch("/tasks/:id",preAuth,async (req,res)=>{
        try {
            const _id = req.params.id
            allowedUpdates = "completed"
            attemptedUpdates = Object.keys(req.body)
            const validUpdate = attemptedUpdates.every((key)=>{
                return key===allowedUpdates
            })
            if(!validUpdate){
                return res.status(400).send({error:"Updates are only allowed for the 'completed' field."})
            }
            const task = await Task.findOne({_id,owner:req.user._id})
            if(!task){
                return res.status(404).send()
            }
            attemptedUpdates.forEach((key)=>{
                task[key] = req.body[key]
            })
            await task.save()
            res.send(task)
        } catch (error) {
            res.status(500).send()
        }
    })
    
    module.exports = router