import express from "express";
import authToken from "../middlewares/auth.js";
import { uploadProfilePicture } from "../middlewares/uploadProfilePicture.js";
import {
  getSettings,
  updateSettings,
  updateProfilePicture,
  updatePassword,
} from "../controllers/userSettingsController.js";

const router = express.Router();


// GET /api/user/settings
router.get("/settings", authToken, getSettings);

// PUT /api/user/settings 
router.put("/settings", authToken, updateSettings);

// PUT /api/user/settings/profile-picture
router.put("/settings/profile-picture", authToken, uploadProfilePicture, updateProfilePicture);

// PUT /api/user/password
router.put("/password", authToken, updatePassword);

export default router;