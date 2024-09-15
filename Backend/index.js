const express = require("express");
const app = express();
require("dotenv").config();

const userRoutes = require("./Routes/User");
const paymentRoutes = require("./Routes/Payments");
const profileRoutes = require("./Routes/Profiles");
const courseRoutes = require("./Routes/Course");

const database = require("./Config/DB_connnection");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const cloudinary = require("./Config/Cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
dotenv.config();

const PORT = process.env.PORT || 4000;
database.connect();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true
    })
);
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp"
    })
)

cloudinary.cloudinaryConnect();

// Routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/Profile", profileRoutes);
app.use("/api/v1/Payment", paymentRoutes);
app.use("/api/v1/courseRoutes", courseRoutes);

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Sever is running"
    })
})

app.listen(PORT, () => {
    console.log(`Sever is running on ${PORT}.`)
})