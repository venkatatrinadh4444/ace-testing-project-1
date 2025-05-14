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
        <p style="color:green;font-size:18px;font-weight:bold">The following are the testing user credentials use the credentials to log in</p>
        <p>Your username is <b>${username}</b></p>
        <p>Your password is <b>${password}</b></p>
        </div>`
    }
    transporter.sendMail(mailOptions)
}

export default sendEmail