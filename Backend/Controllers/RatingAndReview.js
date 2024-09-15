const RatingAndReviewModel = require("../Models/RatingAndReview");
const Course = require("../Models/Course");
const mongoose = require("mongoose");

exports.createRatingAndReview = async (req, res) => {
    try {
        const { rating, review, courseId } = req.body;

        if (!rating || !review || !courseId) {
            return res.status(400).json({
                success: false,
                message: "Missing Propertise"
            })
        }

        const courseExist = await Course.findById(courseId);

        if (!courseExist) {
            return res.status(400).json({
                success: false,
                message: "Invalid Course ID"
            })
        }

        // check user is enrolled or not
        const id = req.user.id;
        const enrolledUser = await Course.findOne({
            _id: courseId,
            studentsEnrolled: { $elemMatch: { $eq: userId } }
        });

        if (!enrolledUser) {
            return res.status(400).json({
                success: false,
                message: "User is not enrolled in this course"
            })
        }

        // Check if user already reviewed the course -- [basically user will able to do only one time review and ratings]
        const userAlreadyReviewed = await RatingAndReviewModel.findById(id);

        if (userAlreadyReviewed) {
            return res.status(403).json({
                success: false,
                message: `Course is already reviewed by user`
            })
        }

        // Create Ratings and Reviews
        const reviewAndRatingDetails = await RatingAndReviewModel.create({
            user: userId,
            rating,
            review,
            course: courseId
        })

        const updateCourse = Course.findByIdAndUpdate({ _id: courseId },
            {
                $push: {
                    ratingAndReviews: reviewAndRatingDetails._id
                }
            },
            { new: true }
        )

        return res.status(200).json({
            success: true,
            message: `Rating and Review submitted successfully`,
            updateCourse
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.averageRatingAndReview = async (req, res) => {
    try {
        const { courseId } = req.body;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Missing Propertise"
            })
        }

        const courseExist = await Course.findById(courseId);

        if (!courseExist) {
            return res.status(400).json({
                success: false,
                message: "Invalid Course ID"
            })
        }

        const result = await RatingAndReviewModel.aggregate([
            {
                $match: { course: mongoose.Schema.Types.ObjectId(courseId) }
            },
            {
                $group: {
                    _id: null,
                    averageRating: {
                        $avg: "rating"
                    }
                }
            }
        ])

        if (result.length > 0) {
            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating
            })
        }

        return res.status(200).json({
            success: true,
            averageRating: `AverageRating is 0, no ratings is given till now`
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getAllRating = async (req, res) => {
    try {
        const ratings = await RatingAndReviewModel.find({}).sort({ rating: "desc" }).populate({
            path: "User",
            select: "firstName lastName email image"
        }).populate({
            path: "Course",
            select: "courseName"
        }).exec();

        return res.status(200).json({
            success: true,
            message: `All Reviews fetch successfully`,
            ratings
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}