const Section = require("../Models/Section");
const Course = require("../Models/Course");

exports.createSection = async (req, res) => {
    try {

        const { sectionName, courseId } = req.body;

        if (!sectionName || !courseId) {
            return res.status(400).json({
                success: false,
                message: "Missing Properties"
            })
        }

        const newSection = await Section.create({ sectionName: sectionName });

        const updateCourse = await Course.findByIdAndUpdate(
            courseId,
            {
                $push: {
                    courseContent: newSection._id
                }
            },
            { new: true }
        )
        // TODO : Populate

        return res.status(200).json({
            success: true,
            message: "Section created successfully",
            data:{
                updateCourse,
                newSection
            }
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

exports.updateSection = async (req, res) => {
    try {
        const { sectionName, sectionId } = req.body;

        if (!sectionName || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "Missing Properties"
            })
        }

        const updateSection = await Section.findByIdAndUpdate(sectionId,
            { sectionName },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Section Updated Successfully",
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

exports.deleteSection = async (req, res) => {
    try {

        const { sectionId } = req.body;

        // Delete section from 
        await Course.find(
            { courseContent: { $eleMatch: sectionId } },
            { $pull: { courseContent: sectionId } }
        )

        await Section.findByIdAndDelete(sectionId);

        return res.status(200).json({
            success: true,
            message: "Section Deleted successfully",
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}