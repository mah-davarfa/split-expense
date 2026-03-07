// src/api/user.api.js
import { http } from "./http.js";

const userApi = {
  getSettings(token) {
    return http("/api/user/settings", { method: "GET", token });
  },

  updateSettings(token, { name, email }) {
    return http("/api/user/settings", { method: "PUT", token, body: { name, email } });
  },

  updateProfilePicture(token, file) {
    const fd = new FormData();
    fd.append("profilePicture", file); // MUST match multer.single("profilePicture")
    return http("/api/user/settings/profile-picture", { method: "PUT", token, body: fd });
  },

  updatePassword(token, { currentPassword, newPassword }) {
    return http("/api/user/password", {
      method: "PUT",
      token,
      body: { currentPassword, newPassword },
    });
  },
};

export default userApi;