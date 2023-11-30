import { comparePassword, hashPassword } from "../helper/authHelper.js";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import JWT from "jsonwebtoken";

//............................................... signup.................................................
export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address, answer } = req.body;
    if (!name) return res.send({ message: "name is required" });
    if (!email) return res.send({ message: "email is required" });
    if (!password) return res.send({ message: "password is required" });
    if (!phone) return res.send({ message: "phone is required" });
    if (!address) return res.send({ message: "address is required" });
    if (!answer) return res.send({ message: "answer is required" });

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: "Already Registered",
      });
    }
    const hashedPassword = await hashPassword(password);
    const user = await new userModel({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      answer,
    }).save();

    res
      .status(200)
      .send({ success: true, message: "User Register Successfullly", user });
  } catch (error) {
    console.log(`error in registration:${error}`.bgRed);
    res.status(500).send({
      success: false,
      message: "Error in Registeration",
      error,
    });
  }
};

// ....................................................login................................................

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(404).send({
        success: false,
        success: "Invaild Email or Password",
      });
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email Not Registered",
      });
    }
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(200).send({
        success: false,
        message: "Invalid Password",
      });
    }
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).send({
      success: true,
      message: "Login Successful",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.log(`error : ${error}`.bgRed);
    res.status(500).send({
      success: false,
      message: "Error In Login",
      error,
    });
  }
};

// ...................................forgotpassword...................................................

export const forgotPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;

    if (!email) {
      return res.status(400).send({
        message: "email is required",
      });
    }

    if (!answer) {
      return res.status(400).send({
        message: "answer is required",
      });
    }

    if (!newPassword) {
      return res.status(400).send({
        message: "newpassword is required",
      });
    }

    const user = await userModel.findOne({ email, answer });

    if (!user) {
      return res.status(400).send({
        success: false,
        message: "Wrong Email or Answer",
      });
    }

    const hashedPassword = await hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashedPassword });

    return res.status(200).send({
      success: true,
      message: "Password Reset Successfully",
    });
  } catch (error) {
    console.log(`error in forgotpassword: ${error}`.bgRed);
    return res.status(500).send({
      success: false,
      message: "something went wrong",
      error,
    });
  }
};

// .................................test controller ....................................................

export const testController = (req, res) => {
  res.send("procted routes");
};

export const updateProfileController = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;
    const user = await userModel.findById(req.user._id);
    //password
    if (password && password.length < 6) {
      return res.json({ error: "Passsword is required and 6 character long" });
    }
    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Profile Updated SUccessfully",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error WHile Update profile",
      error,
    });
  }
};
export const getOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate("products", "-photo")
      .populate("buyer", "name");
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error WHile Geting Orders",
      error,
    });
  }
};
//orders
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate({
        path: "products",
        select: "-photo",
      })
      .populate({
        path: "buyer",
        select: "name",
      })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while getting orders",
      error: error.message, // Only sending error message for security reasons
    });
  }
};

//order status
export const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const orders = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Updateing Order",
      error,
    });
  }
};
