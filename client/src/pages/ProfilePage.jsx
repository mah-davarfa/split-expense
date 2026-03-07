
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthProvider.jsx";
import userApi from "../api/user.api.js";

import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ErrorBanner from "../components/ErrorBanner.jsx";
import Modal from "../components/Modal.jsx";
import { SimpleAvatar } from "../components/SimpleAvatar.jsx";

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
};

const ProfilePage = () => {
  const { user, getToken, setUserAndPersist } = useAuth();
  const token = getToken();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [settingsUser, setSettingsUser] = useState(null);

  // Edit profile modal
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Upload picture
  const [uploadingPic, setUploadingPic] = useState(false);

  // Change password modal
  const [pwOpen, setPwOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const displayUser = settingsUser || user;

  const initialsName = useMemo(() => displayUser?.name || user?.name || "User", [displayUser, user]);

  const loadSettings = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError("");
      const data = await userApi.getSettings(token);
      setSettingsUser(data.user);

      // keep inputs in sync for edit modal
      setName(data.user?.name || "");
      setEmail(data.user?.email || "");

      // also update global user so header/avatar stays consistent
      if (data.user) {
        setUserAndPersist?.(data.user);
      }
    } catch (err) {
      setError(err.message || "Failed to load profile settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const payload = {
        name: name.trim(),
        email: email.trim(),
      };

      const data = await userApi.updateSettings(token, payload);
      setSettingsUser(data.user);
      setUserAndPersist?.(data.user);

      setEditOpen(false);
    } catch (err) {
      setError(err.message || "Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  const onPickProfilePic = async (file) => {
    if (!file) return;
    try {
      setUploadingPic(true);
      setError("");

      const data = await userApi.updateProfilePicture(token, file);
      setSettingsUser(data.user);
      setUserAndPersist?.(data.user);
    } catch (err) {
      setError(err.message || "Failed to upload profile picture");
    } finally {
      setUploadingPic(false);
    }
  };

  const onChangePassword = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      await userApi.updatePassword(token, {
        currentPassword,
        newPassword,
      });

      setPwOpen(false);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stack">
      <h2 className="m-0">Profile</h2>

      {loading && <LoadingSpinner label="Loading profile..." />}
      {error && <ErrorBanner message={error} onClose={() => setError("")} />}

      <div className="card">
        <div className="row-between">
          <div className="flex items-center gap-12">
            <SimpleAvatar name={initialsName} profilePicture={displayUser?.profilePicture} />
            <div className="stack gap-6">
              <div className="fw-600">{displayUser?.name || "—"}</div>
              <div className="muted">{displayUser?.email || "—"}</div>
              <div className="muted text-sm">Joined: {formatDate(displayUser?.createdAt)}</div>
              <div className="muted text-sm">Updated: {formatDate(displayUser?.updatedAt)}</div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <button type="button" onClick={() => setEditOpen(true)}>
              Edit Profile
            </button>
            <button type="button" onClick={() => setPwOpen(true)}>
              Change Password
            </button>
          </div>
        </div>
      </div>

      <div className="card stack">
        <div className="fw-600">Profile Picture</div>

        <div className="muted">
          Upload a JPG/PNG/WEBP. (Capacitor will also send as FormData later.)
        </div>

        <div className="flex items-center gap-10">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onPickProfilePic(e.target.files?.[0])}
            disabled={uploadingPic}
          />
          {uploadingPic && <span className="muted">Uploading...</span>}
        </div>
      </div>

      {/* Edit modal */}
      {editOpen && (
        <Modal title="Edit Profile" onClose={() => setEditOpen(false)}>
          <form className="stack" onSubmit={onSaveProfile}>
            <label className="stack gap-6">
              <span className="muted">Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </label>

            <label className="stack gap-6">
              <span className="muted">Email</span>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
            </label>

            <div className="flex items-center gap-10">
              <button type="submit"  disabled={loading}>
                Save
              </button>
              <button type="button" onClick={() => setEditOpen(false)}>
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Password modal */}
      {pwOpen && (
        <Modal title="Change Password" onClose={() => setPwOpen(false)}>
          <form className="stack" onSubmit={onChangePassword}>
            <label className="stack gap-6">
              <span className="muted">Current Password</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
              />
            </label>

            <label className="stack gap-6">
              <span className="muted">New Password</span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
              />
            </label>

            <div className="flex items-center gap-10">
              <button type="submit"  disabled={loading}>
                Update Password
              </button>
              <button type="button" onClick={() => setPwOpen(false)}>
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

 export default ProfilePage;