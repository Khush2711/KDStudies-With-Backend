const User = require("../Models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// auth | verifiy token
exports.auth = async (req, res, next) => {
    try {
        // Extract Token From cookie || body || header
        const token = req.cookie.token || req.body.token || req.header("Authorisation").replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token is missing"
            })
        }

        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decode;
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: `token is invalid`
            })
        }

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: `something went wrong while validating the token`
        })
    }
}


// student
exports.isStudent = async (req, res) => {
    try {
        if (req.user.role !== 'Student') {
            return res.status(401).json({
                success: false,
                message: `This is protected route for Students only`
            })
        }
        next();
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: `User role is not verified, please try again`
        })
    }
}


// instructor
exports.isInstructor = async (req, res) => {
    try {
        if (req.user.role !== 'Instructor') {
            return res.status(401).json({
                success: false,
                message: `This is protected route for Instructor only`
            })
        }
        next();
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: `User role is not verified, please try again`
        })
    }
}

// is admin
exports.isAdmin = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(401).json({
                success: false,
                message: `This is protected route for Admin only`
            })
        }
        next();
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: `User role is not verified, please try again`
        })
    }
}