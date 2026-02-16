import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import transporter from "../config/nodemailer.js";

export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new userModel({
            name,
            email,
            password: hashedPassword,
        })
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        //Sending Welcome Mail
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Welcome to our platform",
            text: `Welcome to our platform! Your account has been created successfully with email ID: ${email}`
        }

        try {
            await transporter.sendMail(mailOptions);
        } catch (mailError) {
            console.log("Email Error:", mailError.message);
        }

        return res.json({ success: true, message: "User registered successfully" })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        const isMatched = await bcrypt.compare(password, user.password);
        if (!isMatched) {
            return res.json({ success: false, message: "Invalid password" });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        return res.json({ success: true, message: "User logged in successfully" })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        });
        return res.json({ success: true, message: "User logged out successfully" })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

export const sendVerifyOtp = async (req, res) => {
    try {
        const { userID } = req.body;
        const user = await userModel.findById(userID);
        if (!user) {
            return res.json({ success: false, message: 'User not found!' })
        }
        if (user?.isVerified) {
            return res.json({ success: false, message: 'User already verified!' })
        }
        const otp = Math.floor(Math.random() * 900000 + 100000).toString();
        user.verifyOtp = otp;
        user.verifyOtpExpiry = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Verify your email",
            text: `Your verification code is: ${otp}`
        }

        try {
            await transporter.sendMail(mailOptions);
        } catch (mailError) {
            console.log("Email Error: ", mailError.message);
        }

        return res.json({ success: true, message: "OTP sent successfully" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const verifyEmail = async (req, res) => {
    const { userID, otp } = req.body;
    if (!userID || !otp) {
        return res.json({ success: false, message: 'Missing Details' });
    }
    try {
        const user = await userModel.findById(userID);
        if (!user) {
            return res.json({ success: false, message: 'No user found' })
        }
        if (user.verifyOtp === '' || user.verifyOtp !== otp) {
            return res.json({ success: false, message: 'Invalid OTP!' })
        }
        if (user.verifyOtpExpiry < Date.now()) {
            return res.json({ success: false, message: 'OTP expired.' })
        }
        user.isVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpiry = 0;
        await user.save();
        return res.json({ success: true, message: 'Email verified successfully!' });
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

export const isAuthenticated = async (req, res) => {
    try {
        return res.json({ success: true, message: 'Authenticated!' })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

export const sendResetOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.json({ success: false, message: "email is required" })
    }
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'No user found' })
        }

        const otp = Math.floor(Math.random() * 900000 + 100000).toString();
        user.resetOtp = otp;
        user.resetOtpExpiry = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Reset Password",
            text: `Your reset code is: ${otp}`
        }
        try {
            await transporter.sendMail(mailOptions);
            return res.json({ success: true, message: 'Reset OTP sent successfully' })
        } catch (error) {
            return res.json({ success: false, message: error.message })
        }
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        return res.json({ success: false, message: 'Missing Details' })
    }
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'User not found' })
        }
        if (user.resetOtp === '' || user.resetOtp !== otp) {
            return res.json({ success: false, message: 'Invalid OTP' })
        }
        if (user.resetOtpExpiry < Date.now()) {
            return res.json({ success: false, message: 'OTP expired' })
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpiry = 0;
        await user.save();
        return res.json({ success: true, message: 'Password reset successfully' })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}