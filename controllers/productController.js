// ............................................create-product..........................................
import "colors";
import fs from "fs";
import productModel from "../models/productModel.js";
import orderModel from "../models/orderModel.js";
import slugify from "slugify";
import braintree from "braintree";
import dotenv from "dotenv";

dotenv.config();

// ........................................payment gateway..................................................
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});
export const createProductController = async (req, res) => {
  try {
    const { name, slug, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;
    console.log(name, description, price, category, quantity, shipping);
    switch (true) {
      case !name:
        return res.status(500).send({ error: "Name is Required" });
      case !description:
        return res.status(500).send({ error: "Description is Required" });
      case !price:
        return res.status(500).send({ error: "Price is Required" });
      case !category:
        return res.status(500).send({ error: "Category is Required" });
      case !quantity:
        return res.status(500).send({ error: "Quantity is Required" });
      case photo && photo.size > 1000000:
        return res
          .status(500)
          .send({ error: "Photo is required less than 1 MB" });
    }
    const products = new productModel({
      ...req.fields,
      slug: slugify(name),
    });
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      messsage: "Product created Successfully",
      products,
    });
  } catch (error) {
    console.log(`error in create product : ${error}`.bgRed);
    res.status(500).send({
      success: false,
      message: "Error in create product",
      error,
    });
  }
};

// .......................................get-all-products.................................................

export const getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 })
      .populate("category");
    res.status(200).send({
      success: true,
      countTotal: products.length,
      message: "AllProducts",
      products,
    });
  } catch (error) {
    console.log(`error in get-all-product : ${error}`.bgRed);
    res.status(500).send({
      success: false,
      message: "Error in getAll product",
      error,
    });
  }
};

// .......................................get-single-product..............................................

export const getSingleProduct = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");
    res.status(200).send({
      success: true,
      message: "Single Product Fetched",
      product,
    });
  } catch (error) {
    console.log(`error in getting single product : ${error}`.bgRed);
    res.status(500).send({
      success: false,
      message: "Error in getting single product",
      error,
    });
  }
};

// .......................................get-product-photo...............................................

export const productPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photo");
    if (product.photo.data) {
      res.set("Content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }
  } catch (error) {
    console.log(`error in getting product photo : ${error}`.bgRed);
    res.status(500).send({
      success: false,
      message: "Error in getting product photo",
      error,
    });
  }
};

// .......................................delete-product-controller.......................................

export const deleteProductController = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.pid).select("-photo");
    res.status(200).send({
      success: true,
      message: "Product Deleted Successfully",
    });
  } catch (error) {
    console.log(`error in deleting product : ${error}`.bgRed);
    res.status(500).send({
      success: false,
      message: "Error while deleting the product",
      error,
    });
  }
};

// ............................................update-product-controller....................................

export const updateProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;
    //alidation
    switch (true) {
      case !name:
        return res.status(500).send({ error: "Name is Required" });
      case !description:
        return res.status(500).send({ error: "Description is Required" });
      case !price:
        return res.status(500).send({ error: "Price is Required" });
      case !category:
        return res.status(500).send({ error: "Category is Required" });
      case !quantity:
        return res.status(500).send({ error: "Quantity is Required" });
      case photo && photo.size > 1000000:
        return res
          .status(500)
          .send({ error: "photo is Required and should be less then 1mb" });
    }

    const products = await productModel.findByIdAndUpdate(
      req.params.pid,
      { ...req.fields, slug: slugify(name) },
      { new: true }
    );
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: "Product Updated Successfully",
      products,
    });
  } catch (error) {
    console.log(error.bgRed);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Updte product",
    });
  }
};
// .......................................product filter controller..........................

export const productFilterController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length === 2) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await productModel.find(args);
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error.bgRed);
    res.status(400).send({
      success: false,
      message: "error while filtering proudct",
      error,
    });
  }
};

// .........................................product conut controller .............................

export const proudctCountController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error.bgRed);
    res.status(400).send({
      success: false,
      message: "Eoor in getting product count",
      error,
    });
  }
};

export const productListController = async (req, res) => {
  try {
    const perPage = 6;

    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error.bgRed);
    res.status(400).send({
      success: false,
      message: "Error in per-page ctrl",
      error,
    });
  }
};

// ...........................................search product...........................................
export const searchProduct = async (req, res) => {
  try {
    const { keyword } = req.params;
    const result = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo");
    res.json(result);
  } catch (error) {
    console.log(`error in searchproduct :${error}`.bgRed);
    res.status(400).send({
      success: false,
      message: "error in search producct",
      error,
    });
  }
};
// .....................................paymeny gateway api..............................................

export const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

//payment
export const brainTreePaymentController = async (req, res) => {
  try {
    const { nonce, cart } = req.body;
    let total = 0;
    cart.map((i) => {
      total += i.price;
    });
    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          const order = new orderModel({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};
