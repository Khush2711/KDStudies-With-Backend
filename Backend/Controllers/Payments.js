const mongoose = require("mongoose");
const { instance } = require("../Config/Razorpay");
const Course = require("../Models/Course");
const User = require("../Models/User");
const MailSender = require("../Utilis/mailSender");
const { courseEnrollmentEmail } = require("../Mail/Template/courseEnrollmentEmail")


// Create Order
exports.capturePayment = async (req, res) => {
    try {
        // Fetch user id and course id
        const { courseId } = req.body;
        const userId = req.user.id;

        // Validation
        if (!courseId) {
            return res.status(404).json({
                success: false,
                message: "Course Id Not Found"
            })
        }

        let course = await Course.findById(courseId);

        // Course Validation
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course Not Found"
            })
        }

        // Check User has done payment before for the same course
        const uid = new mongoose.Schema.Types.ObjectId(userId);

        if (course.studentsEnrolled.includes(uid)) {
            return res.status(400).json({
                success: false,
                message: "User already enrolled"
            })
        }

        // Create order || Razorpay
        const amount = course.price;
        const currency = "INR";

        const option = {
            amount: amount * 100,
            currency: currency,
            recepit: Math.random(Date.now()).toString(),
            notes: {
                courseId: courseId,
                userId: userId
            }
        }

        // initiate payment using razorpay
        const paymentResponse = await instance.orders.create(option);
        console.log("paymentResponse : ", paymentResponse);

        return res.status(200).json({
            success: true,
            courseName: course.courseName,
            courseDescription: course.CourseDescription,
            thumbnail: course.thumbnail,
            orderID: paymentResponse.id,
            Currency: paymentResponse.currency,
            amount: paymentResponse.amount
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.verifySignature = async (req, res) => {
    try {
        // This is secret which is store in server
        const webhookSecret = "12345678";

        // This is secret which comes with api request
        const signature = req.headers["x-razorpay-signature"];

        const shasum = crypto.createHmac("sha256", webhookSecret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest("hex");

        if (signature === digest) {
            console.log("Payment is authorized");
            const { courseId, userId } = req.body.payload.payment.entity.notes;


            // Find Course and add student in it
            const enrolledCourse = await Course.findOneAndUpdate(
                {
                    _id: courseId
                },
                {
                    $push: {
                        studentsEnrolled: userId
                    }
                },
                { new: true }
            )

            if (!enrolledCourse) {
                return res.status(500).json({
                    success: false,
                    message: "Course not Found"
                })
            }

            // Give access of course to student
            const enrolledStudent = await User.findOneAndUpdate(
                {
                    _id: userId
                },
                {
                    $push: {
                        courses: courseId
                    }
                },
                { new: true }
            )

            // Send Confirmation Mail

            const emailResponse = await MailSender("khushdesai2711@gmail.com",
                `Congratulations, you are onboarded into ${enrolledCourse.courseName}`,
                courseEnrollmentEmail);

            return res.status(200).json({
                sucess: true,
                message: "Signature verify and course added successfully"
            })



        }
        else {
            return res.status(400).json({
                success: false,
                message: "Invalid request"
            })
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}