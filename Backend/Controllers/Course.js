const Course = require("../Models/Course");
const Category = require("../Models/Category");
const User = require("../Models/User");
const { uploadImageToCloudinary } = require("../Utilis/imageUploader");
require("dotenv").config();


exports.createCourse = async (req, res) => {
    try {
        // Get details from request body
        const {
            courseName,
            courseDescription,
            whatYouWillLearn,
            price,
            category,
            tag,
            status,
            instructions } = req.body;

        const thumbnail = req.files.thumbnailImage;

        // Check if any of the required fields are missing
        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !thumbnail || !tag) {
            return res.status(403).json({
                success: false,
                message: `All fileds are required`
            })
        }
        const userId = req.user.id;

        if (!status || status === undefined) {
            status = "Draft";
        }

        // Check if the user is an instructor
        const isInstructor = await User.findById(userId, {
            accountType: "Instructor",
        });

        if (!isInstructor) {
            return res.status(404).json({
                success: false,
                message: "Instructor Details Not Found",
            });
        }

        // Check if the Category given is valid
        const CategoryDetails = await Category.findById(category);
        if (!CategoryDetails) {
            return res.status(404).json({
                success: false,
                message: `CategoryDetails Details not found`
            })
        }

        // Upload the Thumbnail to Cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: isInstructor._id,
            whatYouWillLearn,
            price,
            CategoryDetails: CategoryDetails._id,
            thumbnail: thumbnailImage.secure_url,
            tag,
            instructions,
            status
        })


        // Add new course in Instructor's array
        await User.findByIdAndUpdate(
            { _id: isInstructor._id },
            {
                $push: {
                    course: newCourse._id
                }
            },
            { new: true }
        );

        // update Category
        await Category.findByIdAndUpdate(
            { _id: category },
            {
                $push: {
                    course: newCourse._id,
                },
            },
            { new: true }
        );


        return res.status(200).json({
            success: true,
            message: `New Course created successfully`,
            data: newCourse
        })

    } catch (err) {
        return res.status(500).json({
            success: true,
            message: err.message
        })
    }
}


exports.getAllCourse = async (req, res) => {
    try {
        const allCourses = Course.find({},
            {
                courseName: true,
                price: true,
                thumbnail: true,
                instructor: true,
                ratingAndReviews: true,
                studentsEnrolled: true
            }).populate("instructor").exec();

        return res.status(200).json({
            success: true,
            message: `Data for all courses fetch successfully`,
            data: allCourses
        })


    } catch (err) {
        return res.status(500).json({
            success: true,
            message: err.message
        })
    }
}


exports.getCourseDetails = async (req, res) => {
    try {

        const { courseId } = req.body;

        // Find Is Used By LB
        const courseDetails = await Course.findById(courseId).populate(
            {
                path: "instructor",
                populate: {
                    path: "additionDetails"
                }
            }
        ).populate(
            {
                path: "courseContent",
                populate: {
                    path: "SubSection"
                }
            },
        ).populate("ratingAndReviews")
            .populate("category")
            .populate("studentsEnrolled")
            .exec();

        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: `Could not find the course with courseId : ${courseId}`
            })
        }

        return res.status(200).json({
            success: true,
            message: `Course Details Fetch Successfully`,
            courseDetails
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}