import { useEffect, useState } from "react";

import {
  Camera,
  Save,
  Lock,
  User,
  Mail,
  Phone,
  Trash2,
} from "lucide-react";

import { toast } from "react-toastify";
import { supabase } from "../services/supabase";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import "./AdminProfile.css";

function AdminProfile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

  const [userId, setUserId] = useState("");
  const [authEmail, setAuthEmail] = useState("");

  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "Administrator",
    avatar_url: "",
  });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  /* =========================================
     LOAD PROFILE
  ========================================= */

  async function loadProfile() {
    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        toast.error("No user logged in.");
        return;
      }

      setUserId(user.id);
      setAuthEmail(user.email || "");

      const { data, error } = await supabase
        .from("admin_profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      /* Create profile if it doesn't exist */

      if (!data) {
        const newProfile = {
          id: user.id,
          full_name:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            "Administrator",
          email: user.email || "",
          phone: "",
          role: "Administrator",
          avatar_url: "",
        };

        const {
          data: insertedProfile,
          error: insertError,
        } = await supabase
          .from("admin_profiles")
          .insert(newProfile)
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        setProfile({
          full_name: insertedProfile.full_name || "",
          email:
            insertedProfile.email ||
            user.email ||
            "",
          phone: insertedProfile.phone || "",
          role:
            insertedProfile.role ||
            "Administrator",
          avatar_url:
            insertedProfile.avatar_url || "",
        });

        return;
      }

      setProfile({
        full_name: data.full_name || "",
        email: data.email || user.email || "",
        phone: data.phone || "",
        role: data.role || "Administrator",
        avatar_url: data.avatar_url || "",
      });
    } catch (error) {
      console.error(
        "Profile loading error:",
        error
      );

      toast.error(
        error.message ||
          "Unable to load profile."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================
     UPLOAD PHOTO
  ========================================= */

  async function uploadPhoto(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!userId) {
      toast.error(
        "User information is not available."
      );

      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Please upload a JPG, JPEG, PNG, or WEBP image."
      );

      event.target.value = "";

      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      toast.error(
        "Profile photo must be smaller than 5 MB."
      );

      event.target.value = "";

      return;
    }

    try {
      setUploading(true);

      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

      const filePath =
        `${userId}/avatar-${Date.now()}.${extension}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from("avatars")
        .upload(
          filePath,
          file,
          {
            cacheControl: "3600",
            upsert: true,
          }
        );

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl =
        publicUrlData?.publicUrl;

      if (!publicUrl) {
        throw new Error(
          "Unable to generate profile photo URL."
        );
      }

      const {
        error: updateError,
      } = await supabase
        .from("admin_profiles")
        .update({
          avatar_url: publicUrl,
        })
        .eq("id", userId);

      if (updateError) {
        throw updateError;
      }

      setProfile(
        (previousProfile) => ({
          ...previousProfile,
          avatar_url: publicUrl,
        })
      );

      toast.success(
        "Profile photo updated successfully."
      );
    } catch (error) {
      console.error(
        "Photo upload error:",
        error
      );

      toast.error(
        error.message ||
          "Unable to upload profile photo."
      );
    } finally {
      setUploading(false);

      event.target.value = "";
    }
  }

  /* =========================================
     REMOVE PHOTO
  ========================================= */

  async function removePhoto() {
    if (!profile.avatar_url) {
      toast.info(
        "No profile photo to remove."
      );

      return;
    }

    try {
      setRemoving(true);

      const { error } = await supabase
        .from("admin_profiles")
        .update({
          avatar_url: "",
        })
        .eq("id", userId);

      if (error) {
        throw error;
      }

      setProfile(
        (previousProfile) => ({
          ...previousProfile,
          avatar_url: "",
        })
      );

      toast.success(
        "Profile photo removed."
      );
    } catch (error) {
      console.error(
        "Remove photo error:",
        error
      );

      toast.error(
        error.message ||
          "Unable to remove profile photo."
      );
    } finally {
      setRemoving(false);
    }
  }

  /* =========================================
     SAVE PROFILE
  ========================================= */

  async function saveProfile() {
    const fullName =
      profile.full_name.trim();

    const email =
      profile.email.trim();

    const phone =
      profile.phone.trim();

    if (!fullName) {
      toast.error(
        "Please enter the administrator name."
      );

      return;
    }

    if (!email) {
      toast.error(
        "Please enter an email address."
      );

      return;
    }

    if (
      newPassword.trim() !== "" &&
      newPassword.length < 6
    ) {
      toast.error(
        "Password must contain at least 6 characters."
      );

      return;
    }

    if (
      newPassword.trim() !== "" &&
      newPassword !== confirmPassword
    ) {
      toast.error(
        "Passwords do not match."
      );

      return;
    }

    try {
      setSaving(true);

      /* Update profile table */

      const {
        error: profileError,
      } = await supabase
        .from("admin_profiles")
        .update({
          full_name: fullName,
          email,
          phone,
        })
        .eq("id", userId);

      if (profileError) {
        throw profileError;
      }

      /* Update Supabase Auth email */

      if (
        email.toLowerCase() !==
        authEmail.toLowerCase()
      ) {
        const {
          error: emailError,
        } = await supabase.auth.updateUser({
          email,
        });

        if (emailError) {
          throw emailError;
        }

        setAuthEmail(email);

        toast.info(
          "Email update requested. Check your email if confirmation is required."
        );
      }

      /* Update password */

      if (newPassword.trim() !== "") {
        const {
          error: passwordError,
        } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (passwordError) {
          throw passwordError;
        }
      }

      /* Keep Auth metadata updated */

      const {
        error: metadataError,
      } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          phone,
          avatar_url:
            profile.avatar_url,
        },
      });

      if (metadataError) {
        console.error(
          "Metadata update error:",
          metadataError
        );
      }

      setProfile(
        (previousProfile) => ({
          ...previousProfile,
          full_name: fullName,
          email,
          phone,
        })
      );

      setNewPassword("");
      setConfirmPassword("");

      toast.success(
        "Profile updated successfully."
      );
    } catch (error) {
      console.error(
        "Save profile error:",
        error
      );

      toast.error(
        error.message ||
          "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================
     LOADING
  ========================================= */

  if (loading) {
    return (
      <div className="admin-profile-loading">
        Loading Profile...
      </div>
    );
  }

  /* =========================================
     UI
  ========================================= */

  return (
    <div className="dashboard">

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="main-content">

        <Topbar
          setSidebarOpen={setSidebarOpen}
        />

        <div className="dashboard-body">

          <div className="admin-profile-page">

            <div className="profile-card">

              {/* =================================
                  LEFT SIDE
              ================================= */}

              <div className="avatar-section">

                <div className="avatar-box">

                  {profile.avatar_url ? (

                    <img
                      src={profile.avatar_url}
                      alt="Admin Profile"
                      className="avatar-image"
                    />

                  ) : (

                    <User
                      size={90}
                      color="#ffffff"
                    />

                  )}

                </div>

                {/* PHOTO BUTTONS */}

                <div className="photo-actions">

                  {/* Upload */}

                  <label
                    className="upload-photo"
                    style={{
                      opacity:
                        uploading ||
                        removing
                          ? 0.6
                          : 1,

                      cursor:
                        uploading ||
                        removing
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >

                    <Camera size={18} />

                    {uploading
                      ? "Uploading..."
                      : "Upload Photo"}

                    <input
                      type="file"
                      hidden
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={
                        uploadPhoto
                      }
                      disabled={
                        uploading ||
                        removing
                      }
                    />

                  </label>

                  {/* Delete Photo */}

                  {profile.avatar_url && (

                    <button
                      type="button"
                      className="delete-photo-btn"
                      onClick={
                        removePhoto
                      }
                      disabled={
                        removing ||
                        uploading
                      }
                    >

                      <Trash2
                        size={18}
                      />

                      {removing
                        ? "Removing..."
                        : "Delete Photo"}

                    </button>

                  )}

                </div>

              </div>


              {/* =================================
                  RIGHT SIDE
              ================================= */}

              <div className="profile-form">

                {/* Full Name */}

                <div className="form-group">

                  <label>

                    <User size={18} />

                    Full Name

                  </label>

                  <input
                    type="text"
                    value={
                      profile.full_name
                    }
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        full_name:
                          e.target.value,
                      })
                    }
                  />

                </div>


                {/* Email */}

                <div className="form-group">

                  <label>

                    <Mail size={18} />

                    Email

                  </label>

                  <input
                    type="email"
                    value={
                      profile.email
                    }
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        email:
                          e.target.value,
                      })
                    }
                  />

                </div>


                {/* Phone */}

                <div className="form-group">

                  <label>

                    <Phone size={18} />

                    Phone Number

                  </label>

                  <input
                    type="text"
                    value={
                      profile.phone
                    }
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        phone:
                          e.target.value,
                      })
                    }
                  />

                </div>


                {/* Role */}

                <div className="form-group">

                  <label>

                    <User size={18} />

                    Role

                  </label>

                  <input
                    value={
                      profile.role
                    }
                    disabled
                  />

                </div>


                {/* New Password */}

                <div className="form-group">

                  <label>

                    <Lock size={18} />

                    New Password

                  </label>

                  <input
                    type="password"
                    placeholder="Enter New Password"
                    value={
                      newPassword
                    }
                    onChange={(e) =>
                      setNewPassword(
                        e.target.value
                      )
                    }
                  />

                </div>


                {/* Confirm Password */}

                <div className="form-group">

                  <label>

                    <Lock size={18} />

                    Confirm Password

                  </label>

                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={
                      confirmPassword
                    }
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                  />

                </div>


                {/* Save */}

                <button
                  className="save-profile-btn"
                  onClick={
                    saveProfile
                  }
                  disabled={saving}
                >

                  <Save size={20} />

                  {saving
                    ? "Saving..."
                    : "Save Changes"}

                </button>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default AdminProfile;