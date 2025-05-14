import nodemailer from 'nodemailer'

const transporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:'venkatatrinadh4444@gmail.com',
        pass:'rtecerbfluiivezr'
    }
})

const sendEmail=(name,email,username,password)=> {
    const mailOptions={
        from:'venkatatrinadh4444@gmail.com',
        to:email,
        subject:'User registration credentials',
        html:`<div>
        <p>Your username is ${username}</p>
        <p>Your password is ${password}</p>
        <p>Please use these credentials to login</p>
        </div>`
    }
    transporter.sendMail(mailOptions)
}

export default sendEmail