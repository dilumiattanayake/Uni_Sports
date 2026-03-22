import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { User, Lock, Bell, LogOut, Camera, CheckCircle2, AlertCircle, Edit2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

type ProfileData = {
  name: string;
  email: string;
  profilePhoto?: string;
  registeredSports: string;
  activeSessions: string;
  assignedSports: string;
};

export default function SettingsPage() {
  const { user, role, logout } = useAuth();

  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData>({
    name: "",
     profilePhoto: "",
    email: "",
    registeredSports: "",
    activeSessions: "",
    assignedSports: "",
  });

  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState(true);
  const [photoPreview, setPhotoPreview] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedName, setEditedName] = useState("");


  /* Load logged in user details */
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name,
        email: user.email,
        profilePhoto: user.avatar,
        registeredSports: user.registeredSports,
        activeSessions: user.activeSessions,
        assignedSports: user.assignedSports,
      });

      setPhotoPreview(user.avatar);
      setEditedName(user.name);
    }
  }, [user]);


  /* Upload profile photo */
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);
    setPhotoPreview(previewURL);
  };


  /* Open edit modal */
  const handleOpenEditModal = () => {
    setEditedName(profile.name);
    setIsEditModalOpen(true);
  };

  /* Close edit modal */
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditedName(profile.name);
  };

  /* Save profile changes from modal */
  const handleSaveProfile = async () => {
    if (!editedName.trim()) {
      setErrorMessage("Name cannot be empty");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");
    try {
      const updatedProfile = { ...profile, name: editedName };
      const response = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProfile),
      });

      if (response.ok) {
        setProfile(updatedProfile);
        setSuccessMessage("Profile updated successfully!");
        setIsEditModalOpen(false);
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (err) {
      setErrorMessage("Failed to update profile. Please try again.");
      setTimeout(() => setErrorMessage(""), 3000);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  /* Change password */
  const handlePasswordUpdate = async () => {
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    if (password.newPassword !== password.confirmPassword) {
      setErrorMessage("Passwords do not match");
      setLoading(false);
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    if (!password.currentPassword || !password.newPassword) {
      setErrorMessage("Please fill in all password fields");
      setLoading(false);
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    try {
      const response = await fetch("/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(password),
      });

      if (response.ok) {
        setPassword({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setSuccessMessage("Password updated successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        throw new Error("Failed to update password");
      }
    } catch (err) {
      setErrorMessage("Failed to update password. Please try again.");
      setTimeout(() => setErrorMessage(""), 3000);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


return (
  <DashboardLayout>
    <div className="space-y-6">
      <PageHeader
        title="Profile Settings"
        description="Manage your account information and preferences"
      />

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 flex items-center gap-3">
          <CheckCircle2 className="text-green-600 flex-shrink-0" size={18} />
          <p className="text-sm text-green-800 font-medium">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={18} />
          <p className="text-sm text-red-800 font-medium">{errorMessage}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Personal Information */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-950 text-white dark:text-white">
              <User className="h-4 w-4" />
            </div>
            <h2 className="font-semibold text-foreground">Personal Information</h2>
          </div>

          <div className="space-y-4">
            {/* Profile Photo Section */}
            <div className="flex items-center gap-4 pb-4 border-b border-border">
              <div className="relative">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover border-2 border-indigo-600 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center">
                    <User className="text-indigo-900 dark:text-indigo-950" size={24} />
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-indigo-700 transition-colors duration-200 shadow-sm">
                  <Camera size={12} />
                  <input type="file" onChange={handlePhotoUpload} className="hidden" accept="image/*" />
                </label>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm mb-1">Profile Photo</h3>
                <p className="text-xs text-muted-foreground mb-2">JPG, PNG or GIF. Max 5MB.</p>
                <label className="inline-block px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-medium cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors duration-200">
                  Choose Photo
                  <input type="file" onChange={handlePhotoUpload} className="hidden" accept="image/*" />
                </label>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</label>
                <div className="text-sm text-foreground px-3 py-2 bg-muted/50 rounded-lg border border-border mt-1">
                  {profile.name}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</label>
                <Input
                  name="email"
                  value={profile.email}
                  disabled
                  className="w-full px-3 py-2 border border-border rounded-lg bg-muted/50 text-muted-foreground cursor-not-allowed text-sm mt-1"
                  placeholder="your.email@sliit.lk"
                />
              </div>
            </div>

            <Button
              onClick={handleOpenEditModal}
              disabled={loading}
              className="w-full bg-indigo-900 hover:bg-indigo-950 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-2"
            >
              <Edit2 size={16} />
              Edit Details
            </Button>
          </div>
        </section>

        {/* Change Password */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-950 text-white dark:text-white">
              <Lock className="h-4 w-4" />
            </div>
            <h2 className="font-semibold text-foreground">Change Password</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Password</label>
              <Input
                type="password"
                placeholder="Enter your current password"
                value={password.currentPassword}
                onChange={(e) =>
                  setPassword({ ...password, currentPassword: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-indigo-950 focus:border-transparent transition-all duration-200 text-sm mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">New Password</label>
              <Input
                type="password"
                placeholder="Enter your new password"
                value={password.newPassword}
                onChange={(e) =>
                  setPassword({ ...password, newPassword: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-indigo-950 focus:border-transparent transition-all duration-200 text-sm mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confirm Password</label>
              <Input
                type="password"
                placeholder="Confirm your new password"
                value={password.confirmPassword}
                onChange={(e) =>
                  setPassword({ ...password, confirmPassword: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-indigo-950 focus:border-transparent transition-all duration-200 text-sm mt-1"
              />
            </div>
            <br></br>
            <Button
              onClick={handlePasswordUpdate}
              disabled={loading}
              className="w-full bg-indigo-900 hover:bg-indigo-950 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-2"
            >
              <Edit2 size={16} />
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </section>

        {/* Notification Settings */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Bell className="h-4 w-4" />
            </div>
            <h2 className="font-semibold text-foreground">Notification Settings</h2>
          </div>

          <label className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/80 transition-colors duration-200 border border-border">
            <input
              type="checkbox"
              checked={notifications}
              onChange={() => setNotifications(!notifications)}
              className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
            />
            <div className="flex-1">
              <p className="font-semibold text-foreground text-sm">Email Notifications</p>
              <p className="text-xs text-muted-foreground mt-0.5">Receive updates about sports activities and sessions</p>
            </div>
          </label>
        </section>

      </div>

      {/* Role-Based Activity */}
      {role === "student" && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Student Activity</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Registered Sports
              </p>
              <p className="mt-2 text-3xl font-bold text-foreground">{profile.registeredSports ?? 0}</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Active Sessions
              </p>
              <p className="mt-2 text-3xl font-bold text-foreground">{profile.activeSessions ?? 0}</p>
            </div>
          </div>
        </section>
      )}

      {role === "coach" && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Coach Activity</h2>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Assigned Sports
            </p>
            <p className="mt-2 text-3xl font-bold text-foreground">{profile.assignedSports ?? 0}</p>
          </div>
        </section>
      )}

      {/* Logout Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => { logout(); navigate('/'); }}
          className="bg-red-700 hover:bg-red-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
        >
          <LogOut size={16} />
          Logout
        </Button>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl border border-border shadow-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between bg-indigo-950 text-white p-5 rounded-t-xl">
              <h3 className="font-semibold">Edit Profile</h3>
              <button
                onClick={handleCloseEditModal}
                className="hover:bg-indigo-700 p-1 rounded-lg transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-3 bg-white">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</label>
                <Input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full px-3 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-950 focus:border-transparent transition-all duration-200 text-sm mt-1"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-5 border-t border-border bg-white">
              <Button
                onClick={handleCloseEditModal}
                className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-semibold py-2 px-3 rounded-lg transition-all duration-200 text-sm border-2 border-red-500 hover:bg-red-500 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveProfile}
                disabled={loading}
                className="flex-1 bg-indigo-950 hover:bg-indigo-900 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  </DashboardLayout>
  );
}