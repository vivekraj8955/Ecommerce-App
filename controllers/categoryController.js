import slugify from "slugify";
import categoryModel from "../models/categoryModel.js";

export const createCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(401).send({ message: "name is required" });
    }
    const existingCategory = await categoryModel.findOne({ name });
    if (existingCategory) {
      return res
        .status(200)
        .send({ success: true, message: "category already exist" });
    }
    const category = await new categoryModel({
      name,
      slug: slugify(name),
    }).save();
    res.status(201).send({
      success: true,
      message: "new category created",
      category,
    });
  } catch (error) {
    console.log(`error in createCategory : ${error}`.bgRed);
    res.status(500).send({
      success: false,
      error,
      message: "error in category",
    });
  }
};

// ..........................................updateCategoryController.....................................

export const updateCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;
    const category = await categoryModel.findByIdAndUpdate(
      id,
      { name, slug: slugify(name) },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.log(`error in updateCategoryController : ${error}`.bgRed);
    res.status(500).send({
      success: false,
      message: "Error while updating category",
      error,
    });
  }
};

// ........................................find all category...............................................

export const categoryController = async (req, res) => {
  try {
    const category = await categoryModel.find();
    res.status(200).send({
      success: true,
      message: "All Categories List",
      category,
    });
  } catch (error) {
    console.log(`error in finding all category : ${error}`.bgRed);
    res.status(500).send({
      success: false,
      message: "Error while getting all category",
      error,
    });
  }
};

// ......................................find signle category..............................................

export const singleCategory = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    res.status(200).send({
      success: true,
      message: "Get Single Category Successfull",
      category,
    });
  } catch (error) {
    console.log(`error in find single category : ${error}`.bgRed);
    res.status(500).send({
      success: false,
      message: "Error in finding sinlge category",
      error,
    });
  }
};

// .........................................delete category ..............................................
export const deleteCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findByIdAndDelete({
      _id: req.params.id,
    });
    res.status(200).send({
      success: true,
      message: "Category Successfully Deleted",
      category,
    });
  } catch (error) {
    console.log(`error in deleting category : ${error}`.bgRed);
    res.status(500).send({
      success: false,
      message: "Error in deleting category",
      error,
    });
  }
};
