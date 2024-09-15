const express = require("express")
const router = express.Router()
const { auth } = require("../middlewares/auth")
const {
  deleteAccount,
  updateProfile,
  getAllUsers,
  updateDisplayPicture,
  getEnrolledCourses,
} = require("../controllers/Profile")


// Delet User Account
router.delete("/deleteProfile", auth, deleteAccount)
router.put("/updateProfile", auth, updateProfile)
router.get("/getUserDetails", auth, getAllUsers)
// Get Enrolled Courses
router.get("/getEnrolledCourses", auth, getEnrolledCourses)
router.put("/updateDisplayPicture", auth, updateDisplayPicture)

module.exports = router