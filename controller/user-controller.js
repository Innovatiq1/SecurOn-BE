import User from '../model/userSchema.js';
import Token from '../model/tokenSchema.js';
import OemListModel from '../model/oemListSchema.js';
import sendEmail from '../helpers/sendEmail.js';
import { generateToken } from '../auth/auth.js';
import crypto from 'crypto';
import { systemLogger,userActivityLogger } from '../helpers/loggers.js';


export const userLogIn = async (request, response) => {
    try {
        console.log("Login attempt with:", {
            email: request.body.email,
            password: request.body.password
        });

        // First find the user without password check, using case-insensitive email
        let userCheck = await User.findOne({ 
            email: { $regex: new RegExp('^' + request.body.email + '$', 'i') }
        });
        
        // console.log("User found in DB:", userCheck ? "Yes" : "No");
        if (userCheck) {
            console.log("Found user details:", {
                email: userCheck.email,
                storedPassword: userCheck.password,
                providedPassword: request.body.password
            });
            // console.log("Do passwords match:", userCheck.password === request.body.password);
        }

        // If we found a user, now check with exact password
        if (userCheck && userCheck.password === request.body.password) {
            userActivityLogger.info(`User with ${request.body.email} has been logged in successfully`)
            return response.status(200).json({
                status: 200,
                message: "Welcome! Login Successful!",
                data: userCheck,
                accessToken: generateToken(userCheck.toJSON())
            });
        } else {
            userActivityLogger.warn(`User with ${request.body.email} has entered invalid details`)
            return response.status(200).json({
                message: "Invalid Login Details",
                data: ''
            });
        }
    } catch (error) {
        console.error("Login error:", error);
        systemLogger.error(error)
        return response.status(500).json(error.message);
    }
}


export const userSignUp = async (request, response) => {
    try {
        let userObj = await User.findOne({ email: request.body.email });
        if (userObj) {
            userActivityLogger.warn(`User with ${request.body.email} already Exists`)
            return response.status(200).json({
                status: 200,
                message: "User with Email Id already Exists"

            });


        }
        const user = request.body;
        await User.create(user);
        userActivityLogger.info(`User with ${request.body.email} has been successfully registered`)


        return response.status(200).json({
            status: 200,
            message: `${user.username} has been successfully registered`

        });

    } catch (error) {
        console.log("error is" + error);
        systemLogger.error(error)
        return response.status(500).json(error.message);
    }
}


export const forgotPassword = async function (req, res, next) {
    try {
        let user = await User.findOne({ email: req.body.email });

        if (!user){
            userActivityLogger.warn(`User with ${request.body.email} doesn't exist`)
            return res.status(400).send("user with given email doesn't exist");
        }
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
        systemLogger.error(e)
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
        userActivityLogger.info(`User with ${req.body.userId} has resetted the password sucessfully`)
        res.send("password reset sucessfully.");

    } catch (e) {
        systemLogger.error(e)
        next(e);
    }
};