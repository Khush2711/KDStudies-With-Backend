const Category = require("../Models/Category");

exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || !description) {
            return res.status(403).json({
                success: false,
                message: `All fields are required`
            })
        }

        const CategoryPresent = await Category.findOne({ name, description });

        if (CategoryPresent) {
            return res.status(403).json({
                success: false,
                message: `Category Already Present`
            })
        }

        const CategoryDetails = await Category.create({
            name,
            description
        })

        // console.log(`${CategoryDetails}`);

        return res.status(200).json({
            success: true,
            message: `Category created successfully`
        })

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

exports.showAllCategory = async (req, res) => {
    try {
        const allCategories = await Category.find({}, { name: true, description: true });

        return res.status(200).json({
            success: true,
            allCategories
        })

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

exports.categoryPageDetails = async (req, res) => {
    try {
        const { categoryId } = req.body;

        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: `Missing Properties`
            })
        }


        const selectedCategory = await Category.findById(categoryId).populate("course").exec();

        if (!selectedCategory) {
            return res.status(404).json({
                success: false,
                message: `Data Not Found`
            })
        }

        const differentCategory = await Category.find({
            _id: { $ne: categoryId }
        }).populate("course")
            .exec();

        //get top 10 selling courses

        return res.status(200).json({
            success: true,
            data: {
                selectedCategory,
                differentCategory
            }
        })


    } catch (error) {
        return res.status(404).json({
            success: false,
            message: `Data Not Found`
        })
    }
}