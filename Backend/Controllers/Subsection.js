const SubSection = require("../Models/Subsection");
const Section = require("../Models/Section");
const { uploadImageToCloudinary } = require("../Utilis/imageUploader");
require("dotenv").config();

exports.createSubSection = async (req, res) => {
    try {
        const { sectionId, title, timeDuration, description } = req.body;

        const video = req.files?.videoFile;

        if (!sectionId || !title || !timeDuration || !description || !video) {
            return res.status(400).json({
                success: false,
                message: "All fileds are required"
            })
        }

        

        const uploadVideoDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

        const newSubSection = await SubSection.create({ title, timeDuration, description, videoUrl: uploadVideoDetails.secure_url })

        const updatedSection = await Section.findByIdAndUpdate(sectionId,
            {
                $push: {
                    subSection: newSubSection._id
                }
            },
            { new: true }
        ).populate("subSection").exec();

        return res.status(200).json({
            success: true,
            message: "Create SubSection Successfully",
            updatedSection
        })

    } catch (error) {
        console.log(`Error raise at time of creating subsection : ${error}`);
        return res.status(500).json({
            success: false,
            message: "Internal Error Message",
        })
    }
}

exports.updateSubSection = async (req, res) => {
    try {
        const { subSectionId, title, description, timeDuration, videoUrl } = req.body
        const subSection = await SubSection.findOne({ _id: subSectionId })

        if (!subSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
                subSection
            })
        }

        if (title !== undefined) {
            subSection.title = title
        }

        if (description !== undefined) {
            subSection.description = description
        }
        if (req.files && req.files.video !== undefined) {
            const video = req.files.video
            const uploadDetails = await uploadImageToCloudinary(
                video,
                process.env.FOLDER_NAME
            )
            subSection.videoUrl = uploadDetails.secure_url
            subSection.timeDuration = `${uploadDetails.duration}`
        }

        if (timeDuration !== undefined) {
            subSection.timeDuration = timeDuration;
        }

        if (videoUrl !== undefined) {
            subSection.videoUrl = videoUrl;
        }

        await subSection.save()

        return res.json({
            success: true,
            message: "SubSection updated successfully",
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "An error occurred while updating the section",
        })
    }
}


exports.deleteSubSection = async (req, res) => {
    try {
        const { subSectionId, sectionId } = req.body
        await Section.findByIdAndUpdate(
            { _id: sectionId },
            {
                $pull: {
                    subSection: subSectionId,
                },
            }
        )
        const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })

        if (!subSection) {
            return res
                .status(404)
                .json({ success: false, message: "SubSection not found" })
        }

        return res.json({
            success: true,
            message: "SubSection deleted successfully",
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "An error occurred while deleting the SubSection",
        })
    }
}