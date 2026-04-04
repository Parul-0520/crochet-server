const { User } = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const { sendEmail } = require('../helper/emailService');

// --- 1. SIGNUP (OTP logic ke saath merge kar diya) ---
router.post('/signup', async (req, res) => {
    try {
        const { name, phone, email, password, isAdmin } = req.body;
        
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.json({ error: true, msg: "User already exist with this email" });
        }
        
        const existingUserByPh = await User.findOne({ phone: phone });
        if (existingUserByPh) {
            return res.json({ error: true, msg: "User already exist with this phone number" });
        }

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            phone,
            email,
            password: hashedPassword,
            isAdmin,
            otp: verifyCode,
            otpExpires: Date.now() + 600000, // 10 mins
        });

        await user.save();

        // 4. Send Email 
        try {
            await sendEmail(
                email, 
                "Verify Your Email", 
                `Your OTP is ${verifyCode}`, 
                `<b>Your OTP is ${verifyCode}</b>`
            );
            console.log("Email sent successfully to:", email);
        } catch (mailErr) {
            console.error("Nodemailer Error:", mailErr);
        }

        res.status(200).json({
            error: false,
            msg: "OTP Sent to email! Please verify."
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, msg: error.message });
    }
});

// --- 2. VERIFY OTP ---
router.post('/verifyemail', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        if (user.otp === otp && user.otpExpires > Date.now()) {
            user.isVerified = true;
            user.otp = null; 
            user.otpExpires = null;
            await user.save();
            
            // Verification ke baad token dena safe hota hai
            const token = jwt.sign(
                { email: user.email, id: user._id },
                process.env.JSON_WEB_TOKEN_SECRET_KEY,
                { expiresIn: '7d' }
            );

            return res.status(200).json({ 
                success: true, 
                message: "Email verified successfully!",
                token: token,
                user: user 
            });
        } else {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- 3. SIGNIN ---
router.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email: email });

        if (!existingUser) {
            return res.status(404).json({ error: true, msg: "User not found!" });
        }

        // Check if user is verified
        if (existingUser.isVerified === false) {
            return res.status(403).json({ error: true, msg: "Please verify your email first!" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ error: true, msg: "Invalid Credentials!" });
        }

        const token = jwt.sign(
            { email: existingUser.email, id: existingUser._id },
            process.env.JSON_WEB_TOKEN_SECRET_KEY,
            { expiresIn: '24h' }
        );

        const { password: userPassword, ...userData } = existingUser._doc;

        res.status(200).json({
            error: false,
            user: userData,
            token: token,
            msg: "User Authenticated"
        });

    } catch (error) {
        res.status(500).json({ error: true, msg: "Something went wrong" });
    }
});

// --- 3. GET ALL USERS ---
router.get('/', async (req, res) => {
    try {
        const userList = await User.find().select('-password');
        if (!userList) {
            return res.status(500).json({ success: false });
        }
        res.status(200).send(userList);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 4. GET SINGLE USER BY ID ---
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).send(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 5. DELETE USER ---
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (user) {
            return res.status(200).json({ success: true, message: 'The user is deleted!' });
        } else {
            return res.status(404).json({ success: false, message: "User not found!" });
        }
    } catch (err) {
        return res.status(400).json({ success: false, error: err.message });
    }
});

// --- 6. UPDATE USER ---
router.put('/:id', async (req, res) => {
    try {
        const { name, phone, email, password } = req.body;
        const userExist = await User.findById(req.params.id);
        if (!userExist) return res.status(404).send('User not found!');

        let newPassword;
        if (password) {
            newPassword = await bcrypt.hash(password, 10);
        } else {
            newPassword = userExist.password;
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                name: name,
                phone: phone,
                email: email,
                password: newPassword
            },
            { new: true }
        ).select('-password');

        if (!user) return res.status(400).send('The user cannot be updated!');
        res.send(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 7. CHANGE PASSWORD ---
router.put('/change-password/:id', async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ error: true, msg: "User not found!" });

        const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ error: true, msg: "Current password is incorrect!" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(req.params.id, {
            password: hashedPassword
        });

        res.status(200).json({ error: false, msg: "Password changed successfully!" });
    } catch (err) {
        res.status(500).json({ error: true, msg: err.message });
    }
});

// --- 8. GOOGLE LOGIN ---
router.post('/google-login', async (req, res) => {
    try {
        const { email, name, image } = req.body;
        let user = await User.findOne({ email: email });

        if (!user) {
            user = new User({
                name: name,
                email: email,
                phone: "",
                images: image ? [image] : [],
                password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10)
            });
            await user.save();
        }

        const token = jwt.sign(
            { email: user.email, id: user._id },
            process.env.JSON_WEB_TOKEN_SECRET_KEY,
            { expiresIn: '7d' }
        );

        const { password, ...userData } = user._doc;
        return res.status(200).json({
            error: false,
            user: userData,
            token: token,
            msg: "Google Login Successful!"
        });

    } catch (error) {
        console.error("DETAILED BACKEND ERROR:", error);
        return res.status(401).json({
            error: true,
            msg: error.message
        });
    }
});


router.post('/forgotPassword', async (req, res) => {
    try {
        const { email } = req.body;
        const existingUser = await User.findOne({ email: email });

        if (!existingUser) {
            return res.status(404).json({ error: true, msg: "User not found" });
        }

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        existingUser.otp = verifyCode;
        existingUser.otpExpires = Date.now() + 600000; 
        await existingUser.save();

        // CHANGE HERE: Result ko variable mein lo
        const emailResponse = await sendEmail(
            email, 
            "Reset Password OTP", 
            `Your OTP is ${verifyCode}`, 
            `<b>Your OTP is ${verifyCode}</b>`
        );

        // Sirf tabhi success bhejo jab emailResponse.success true ho
        if (emailResponse.success) {
            console.log("Forgot Password Email Sent Successfully"); 
            return res.status(200).json({ error: false, msg: "OTP Sent to email!" });
        } else {
            // Agar Nodemailer fail hua (Timeout), toh yahan aayega
            console.error("Nodemailer Error Details:", emailResponse.error);
            return res.status(500).json({ error: true, msg: "Email service down. Try again later." });
        }

    } catch (error) {
        res.status(500).json({ error: true, msg: error.message });
    }
});

router.post('/resetPassword', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ error: true, msg: "User not found!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user.password = hashedPassword;
        user.otp = undefined; 
        user.otpExpires = undefined;
        
        await user.save();

        res.status(200).json({
            error: false,
            msg: "Password updated successfully!"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: true, msg: "Internal Server Error" });
    }
});

module.exports = router;