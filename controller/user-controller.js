import User from '../model/userSchema.js';
import Token from '../model/tokenSchema.js';
import OemListModel from '../model/oemListSchema.js';
import sendEmail from '../helpers/sendEmail.js';
import { generateToken } from '../auth/auth.js';
import crypto from 'crypto';


export const userLogIn = async (request, response) => {


    try {

        //          let oemList =['Solarwinds','Cisco','Dell','Mircosoft','F5','Fortinet','Aruba','Hpe','Alcatel-Lucent'];
        // for (const oem of oemList){
        //     OemListModel.create({oemName:oem});
        // }

        let user = await User.findOne({ email: request.body.email, password: request.body.password });

        if (user) {

            return response.status(200).json({
                status: 200,
                message: "Welcome! Login Successful!",
                data: user,
                accessToken: generateToken(user.toJSON())
            });

        } else {

            return response.status(200).json({
                message: "Invalid Login Details",
                data: ''

            });
        }

    } catch (error) {
        return response.status(500).json(error.message);

    }
}


export const userSignUp = async (request, response) => {
    try {
        let userObj = await User.findOne({ email: request.body.email });
        if (userObj) {

            return response.status(200).json({
                status: 200,
                message: "User with Email Id already Exists"

            });


        }
        const user = request.body;
        await User.create(user);

        return response.status(200).json({
            status: 200,
            message: `${user.username} has been successfully registered`

        });

    } catch (error) {

        console.log("error is" + error);

        return response.status(500).json(error.message);
    }
}


export const forgotPassword = async function (req, res, next) {
    try {
        let user = await User.findOne({ email: req.body.email });

        if (!user)
            return res.status(400).send("user with given email doesn't exist");

        let token = await Token.findOne({ userId: user._id });

        if (!token) {
            token = await new Token({
                userId: user._id,
                token: crypto.randomBytes(32).toString("hex"),
            }).save();
        }
        res.send("password reset link sent to your email account");
        const link = `${process.env.BASE_URL}/auth/password-reset/${user._id}/${token.token}`;
        await sendEmail(user.email, "Password Reset Link", link);

        res.send("password reset link sent to your email account");
    } catch (e) {
        next(e);
    }
};



export const resetPassword = async function (req, res, next) {
    try {

        const user = await User.findById(req.body.userId);
        if (!user) return res.status(400).send("invalid link or expired");

        const token = await Token.findOne({
            userId: user._id,
            token: req.body.token,
        });
        if (!token) return res.status(400).send("Invalid link or expired");

        user.password = req.body.password;
        await user.save();
        await token.delete();

        res.send("password reset sucessfully.");

    } catch (e) {
        next(e);
    }
};