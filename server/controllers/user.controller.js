import userModel from "../models/user.model.js";

export const getUserData = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userID);
    if (!user) {
      return res.json({ success: false, message: "No user found" });
    }
    return res.json({
      success: true,
      userData: {
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });                                             
  }
};
