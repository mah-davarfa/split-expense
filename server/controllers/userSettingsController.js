import bcrypt from "bcrypt";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS || 10);

const httpError = (message, status) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

// GET /api/user/settings
export const getSettings = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return next(httpError("Unauthorized", 401));

    const user = await User.findById(userId).select("name email profilePicture createdAt updatedAt");
    if (!user) return next(httpError("User not found", 404));

    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

// PUT /api/user/settings    Allows updating name + email
export const  updateSettings = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return next(httpError("Unauthorized", 401));

    const { name, email } = req.body;

    const update = {};

    if (name !== undefined) {
      if (!String(name).trim()) return next(httpError("Name is required", 400));
      if (!/^[^<>&]+$/.test(String(name).trim()))
        return next(httpError("name cannot contain <, >, or &", 400));
      if (String(name).trim().length < 2) return next(httpError("Name must be at least 2 chars", 400));
      update.name = String(name).trim();
    }

    if (email !== undefined) {
      const cleanEmail = String(email).trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail))
        return next(httpError("Email format is not valid", 400));

      const exists = await User.findOne({ email: cleanEmail, _id: { $ne: userId } });
      if (exists) return next(httpError("Email is already in use", 409));

      update.email = cleanEmail;
    }

    if (Object.keys(update).length === 0) {
      return next(httpError("No valid fields to update", 400));
    }

    const user = await User.findByIdAndUpdate(userId, update, {
      new: true,
      runValidators: true,
      select: "name email profilePicture createdAt updatedAt",
    });

    if (!user) return next(httpError("User not found", 404));

    res.status(200).json({ message: "Settings updated", user });
  } catch (err) {
    next(err);
  }
};

// PUT /api/user/settings/profile-picture
// expects multipart/form-data with field name: "profilePicture"
export const updateProfilePicture = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return next(httpError("Unauthorized", 401));
    if (!req.file) return next(httpError("No file uploaded (profilePicture)", 400));

    const userBefore = await User.findById(userId).select("profilePicture profilePicturePublicId");
    if (!userBefore) return next(httpError("User not found", 404));

    // upload
    const b64 = req.file.buffer.toString("base64");
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;
// file:{
//   buffer: <Buffer ...>,
//   mimetype: "image/jpeg",
//   originalname: "receipt.jpg",
//   size: 123456
// }
//data:image/jpg;base64,iVBORw0KGgoAAAANSUhEUg...
    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: "split-expense/profile-pictures",
      resource_type: "image",
    });

    // delete old (best effort)
    if (userBefore.profilePicturePublicId) {
      try {
        await cloudinary.uploader.destroy(userBefore.profilePicturePublicId);
      } catch {
        // don’t fail the request if delete fails
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        profilePicture: uploadResult.secure_url,
        profilePicturePublicId: uploadResult.public_id,
      },
      { new: true, select: "name email profilePicture profilePicturePublicId createdAt updatedAt" }
    );

    res.status(200).json({ message: "Profile picture updated", user });
  } catch (err) {
    next(err);
  }
};


// PUT /api/user/password
// body: { currentPassword, newPassword }
export const updatePassword = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return next(httpError("Unauthorized", 401));

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(httpError("currentPassword and newPassword are required", 400));
    }
    if (String(newPassword).trim().length <5){
        return next(httpError("New password must be at least 5 characters", 400));
    }

    const user = await User.findById(userId).select("password");
        if (!user) return next(httpError("User not found", 404));
        
     const ok = await bcrypt.compare(String(currentPassword), user.password);
         if (!ok) return next(httpError("Current password is incorrect", 403)); 
          const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashed = await bcrypt.hash(String(newPassword).trim(), salt);

    user.password = hashed;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
};   
