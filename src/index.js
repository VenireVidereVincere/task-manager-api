//requiring dependencies
const express = require("express")
require("./db/mongoose")
const usersRouter = require("./routers/users")
const tasksRouter = require("./routers/tasks")


const app = express()

// process.env.PORT is the port used by Heroku, the host of the app.
const port = process.env.PORT


app.use(express.json())
app.use(usersRouter)
app.use(tasksRouter)

app.listen(port,()=>{
    console.log("Server is up on port " + port)
})

const Task = require("./models/task")
const User = require("./models/user")


