const Profile = require("../Models/Profile");
const User = require("../Models/User");
const Course = require("../Models/Course");
const { uploadImageToCloudinary } = require("../Utilis/imageUploader");

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gender, dateOfBirth, about, contactNumber } = req.body;

    if (!gender || !userId || !contactNumber) {
      return res.status(400).json({
        success: false,
        message: "Missing Properties"
      })
    }

    const findUser = await User.findById(userId);

    if (!findUser) {
      return res.status(404).json({
        success: false,
        message: "User doesn't exist"
      })
    }


    const profileId = findUser.additionDetails;

    const profileDetails = await Profile.findById(profileId);

    profileDetails.gender = gender;
    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.contactNumber = contactNumber;

    await profileDetails.save();

    return res.status(200).json({
      success: true,
      message: "Profile Update Successfully",
      profileDetails
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

exports.deleteAccount = async (req, res) => {
  try {
    const id = req.user.id;

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    await Course.updateMany(
      { studentsEnrolled: ObjectId(id) },
      { $pull: { studentsEnrolled: ObjectId(id) } }
    )

    await Profile.findByIdAndDelete({ _id: user.additionDetails });

    // TODO : Add business logic for task scheduling - crone job
    await User.findByIdAndDelete({ _id: id });


    return res.status(200).json({
      success: true,
      message: "Account Delete Successfully"
    })

  } catch (error) {
    console.log(`Error occured while deleteting account :${error}`);
    
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

exports.getAllUsers = async (req, res) => {

  try {
    const id = req.user.id;

    const user = await User.findById(id).populate("additionDetails").exec();

    res.status(200).json({
      success: true,
      message: "User Data Fetch Successfully",
      user
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id
    const userDetails = await User.findOne({
      _id: userId,
    })
      .populate("courses")
      .exec()
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userDetails}`,
      })
    }
    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
};

exports.updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture
    const userId = req.user.id
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    )
    console.log(image)
    const updatedProfile = await User.findByIdAndUpdate(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    )
    res.send({
      success: true,
      message: `Image Updated successfully`,
      data: updatedProfile,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
};