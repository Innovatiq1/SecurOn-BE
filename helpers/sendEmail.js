
import nodemailer from 'nodemailer';

const sendEmail = async (email, subject, text) => {

    console.log("@@@@@@@@@"+process.env.USER +"***"+process.env.PASS);
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: 587,
            secure: true,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.USER,
            to: email,
            subject: subject,
            text: text,
        });

        console.log("email sent sucessfully");
    } catch (error) {
        console.log(error, "email not sent");
    }
};

//module.exports = sendEmail;
export default sendEmail;