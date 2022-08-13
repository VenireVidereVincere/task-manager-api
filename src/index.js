//requiring dependencies
const app = require("./app")

// process.env.PORT is the port used by Heroku, the host of the app.
const port = process.env.PORT

app.listen(port,()=>{
    console.log("Server is up on port " + port)
})