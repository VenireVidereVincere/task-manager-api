const sgMail = require("@sendgrid/mail")

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email,name)=>{
    sgMail.send({
        to:email,
        from:"alan_jurado_canseco@hotmail.com",
        subject:"Thanks for joining our Task Manager App!",
        text:`Welcome to the family, ${name}! I hope you enjoy your stay, let me know how you like the app.`
    })
}

const sendTerminationEmail = (email,name)=>{
    sgMail.send({
        to:email,
        from:"alan_jurado_canseco@hotmail.com",
        subject:"We're sorry to see you go - Your account has been deleted",
        text:`Your account has been terminated entirely, ${name}. Please let us know what we could have done better to keep you as a customer, if there was anything`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendTerminationEmail
}