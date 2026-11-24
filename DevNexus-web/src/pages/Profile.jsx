import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { addUser } from "../redux/userSlice";
import { getDeveloperAvatar } from "../utils/avatar";
import { BASE_URL } from "../config/api";

function Profile() {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();

  const [isPreview, setIsPreview] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    age: user?.age || "",
    gender: user?.gender || "",
    about: user?.about || "",
    skills: user?.skills?.join(", ") || "",
  });

  // Automatically hide notifications after 4 seconds
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [message]);

  // Synchronize form data when user state updates
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        age: user.age || "",
        gender: user.gender || "",
        about: user.about || "",
        skills: user.skills?.join(", ") || "",
      });
    }
  }, [user]);

  // Handle form changes
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Select profile photo
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessageType("error");
      setMessage("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessageType("error");
      setMessage("Image size must be less than 5 MB.");
      return;
    }

    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
    setMessage("");
  };

  // Upload profile photo
  const handleUploadPhoto = async () => {
    if (!selectedFile) {
      setMessageType("error");
      setMessage("Please select a photo first.");
      return;
    }

    const data = new FormData();
    data.append("photo", selectedFile);

    setUploading(true);
    try {
      setMessageType("success");
      setMessage("Uploading photo...");

      const res = await axios.post(
        `${BASE_URL}/profile/upload-photo`,
        data,
        { withCredentials: true }
      );

      dispatch(addUser(res.data));
      setSelectedFile(null);

      setMessageType("success");
      setMessage("Profile photo uploaded successfully!");
    } catch (err) {
      setMessageType("error");
      setMessage(err.response?.data || "Photo upload failed.");
    } finally {
      setUploading(false);
    }
  };

  // Save profile details
  const handleSave = async (e) => {
    e.preventDefault();
    setMessage("");
    setSaving(true);

    try {
      const res = await axios.patch(
        `${BASE_URL}/profile/edit`,
        {
          ...formData,
          age: formData.age ? Number(formData.age) : undefined,
          skills: formData.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter((skill) => skill !== ""),
        },
        { withCredentials: true }
      );

      dispatch(addUser(res.data));

      setMessageType("success");
      setMessage("Profile saved successfully!");
    } catch (err) {
      setMessageType("error");
      setMessage(err.response?.data || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <span className="loading loading-spinner loading-md text-[#8B83F7]"></span>
      </div>
    );
  }

  const isUserPremium = Boolean(user?.isPremium || user?.premium?.isActive);
  const profileImage = imagePreview || getDeveloperAvatar(user);

  const parsedSkills = formData.skills
    ? formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-[#151923] text-[#F1F2F8] py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#2B3449]">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-[#F1F2F8] tracking-tight">
                My Profile
              </h1>
              {isUserPremium && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D9B875]/20 border border-[#D9B875]/50 text-[#D9B875] text-xs font-bold shadow-md shadow-[#D9B875]/20">
                  <span>👑</span>
                  <span>Premium Member</span>
                </span>
              )}
            </div>
            <p className="text-sm text-[#A5AEC0] mt-1">
              Manage your developer identity, skills showcase, and portfolio details
            </p>
          </div>

          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-[#222A3B] hover:bg-[#2B3449] text-[#F1F2F8] text-sm font-semibold border border-[#2B3449] transition lg:hidden"
            onClick={() => setIsPreview(!isPreview)}
          >
            {isPreview ? "Edit Profile" : "Preview Card"}
          </button>
        </div>

        {/* Global Toast Notification */}
        {message && (
          <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top-4 duration-300">
            <div
              className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-sm font-medium ${
                messageType === "success"
                  ? "bg-[#222A3B]/95 border-[#55B8E8]/50 text-[#55B8E8] backdrop-blur-md"
                  : "bg-rose-950/90 border-rose-500/40 text-rose-200 backdrop-blur-md"
              }`}
            >
              <span>{messageType === "success" ? "✓" : "⚠"}</span>
              <span>{message}</span>
            </div>
          </div>
        )}

        {/* Two Column Layout: Left Form, Right Live Card Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form & Photo Upload */}
          <div className={`lg:col-span-7 space-y-6 ${isPreview ? "hidden lg:block" : "block"}`}>
            
            {/* Photo Upload Card */}
            <div className="rounded-3xl glass-card border border-[#2B3449] p-6 sm:p-7">
              <h2 className="text-lg font-bold text-[#F1F2F8] mb-4">
                Profile Avatar
              </h2>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group">
                  <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-[#8B83F7]/30 bg-[#1B2130] shadow-xl">
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <label
                    htmlFor="profilePhoto"
                    className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-[#8B83F7] hover:bg-[#7C73EB] text-white flex items-center justify-center cursor-pointer shadow-lg transition"
                    title="Change profile picture"
                  >
                    📷
                  </label>
                  <input
                    id="profilePhoto"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <p className="text-sm font-semibold text-[#F1F2F8]">
                    Upload a high quality portrait
                  </p>
                  <p className="text-xs text-[#A5AEC0]">
                    JPG, PNG, or GIF up to 5 MB. Click the camera icon to select a photo.
                  </p>

                  {selectedFile && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleUploadPhoto}
                        disabled={uploading}
                        className="px-4 py-2 rounded-xl gradient-primary text-white text-xs font-semibold shadow-md shadow-[#8B83F7]/30 hover:opacity-90 transition disabled:opacity-50"
                      >
                        {uploading ? "Uploading..." : "Upload New Photo"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Form Details */}
            <form
              onSubmit={handleSave}
              className="rounded-3xl glass-card border border-[#2B3449] p-6 sm:p-7 space-y-5"
            >
              <h2 className="text-lg font-bold text-[#F1F2F8]">
                Personal & Professional Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#A5AEC0] mb-1.5">
                    First Name
                  </label>
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#151923] border border-[#2B3449] text-[#F1F2F8] text-sm focus:outline-none focus:border-[#8B83F7] focus:ring-1 focus:ring-[#8B83F7] transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#A5AEC0] mb-1.5">
                    Last Name
                  </label>
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#151923] border border-[#2B3449] text-[#F1F2F8] text-sm focus:outline-none focus:border-[#8B83F7] focus:ring-1 focus:ring-[#8B83F7] transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#A5AEC0] mb-1.5">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    min="18"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#151923] border border-[#2B3449] text-[#F1F2F8] text-sm focus:outline-none focus:border-[#8B83F7] focus:ring-1 focus:ring-[#8B83F7] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#A5AEC0] mb-1.5">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#151923] border border-[#2B3449] text-[#F1F2F8] text-sm focus:outline-none focus:border-[#8B83F7] focus:ring-1 focus:ring-[#8B83F7] transition"
                  >
                    <option value="" className="bg-[#1B2130] text-[#A5AEC0]">Select gender</option>
                    <option value="male" className="bg-[#1B2130]">Male</option>
                    <option value="female" className="bg-[#1B2130]">Female</option>
                    <option value="others" className="bg-[#1B2130]">Others</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#A5AEC0] mb-1.5">
                  About
                </label>
                <textarea
                  name="about"
                  value={formData.about}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Share your development background, projects you're excited about, and technologies you want to collaborate on..."
                  className="w-full px-4 py-3 rounded-xl bg-[#151923] border border-[#2B3449] text-[#F1F2F8] placeholder-[#A5AEC0]/40 text-sm focus:outline-none focus:border-[#8B83F7] focus:ring-1 focus:ring-[#8B83F7] transition resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#A5AEC0] mb-1.5">
                  Skills (comma separated)
                </label>
                <input
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="React, TypeScript, Node.js, Python, GraphQL, Tailwind"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#151923] border border-[#2B3449] text-[#F1F2F8] placeholder-[#A5AEC0]/40 text-sm focus:outline-none focus:border-[#8B83F7] focus:ring-1 focus:ring-[#8B83F7] transition"
                />
                <p className="text-[11px] text-[#A5AEC0]/70 mt-1">
                  Separate technologies with commas. They will render as interactive tags on your developer card.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 px-4 rounded-xl gradient-primary text-white font-semibold text-sm shadow-lg shadow-[#8B83F7]/30 hover:opacity-90 transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>

            </form>
          </div>

          {/* Right Column: Live Card Preview */}
          <div className={`lg:col-span-5 ${!isPreview ? "hidden lg:block" : "block"} lg:sticky lg:top-24`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#A5AEC0]">
                  Live Feed Preview
                </span>
                <span className="text-xs text-[#8B83F7] font-medium">
                  How others see you
                </span>
              </div>

              <div className="rounded-3xl overflow-hidden glass-card border border-[#2B3449] shadow-2xl">
                
                {/* Photo Banner */}
                <div className="relative h-72 w-full bg-gradient-to-b from-[#1B2130] via-[#222A3B] to-[#151923] overflow-hidden flex items-center justify-center">
                  <img
                    src={profileImage}
                    alt="Profile avatar"
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1B2130] via-transparent to-black/30 pointer-events-none"></div>

                  {isUserPremium && (
                    <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D9B875]/20 backdrop-blur-md border border-[#D9B875]/50 text-[#D9B875] text-xs font-bold shadow-lg shadow-[#D9B875]/20">
                      <span>👑</span>
                      <span>VIP Member</span>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-6 bg-[#1B2130] border-t border-[#2B3449]/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-extrabold text-[#F1F2F8] tracking-tight">
                      {formData.firstName || "Your"} {formData.lastName || "Name"}
                    </h2>
                    {formData.age && (
                      <span className="text-base font-bold text-[#A5AEC0]">
                        {formData.age}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#A5AEC0]">
                    {formData.gender && (
                      <span className="capitalize px-2 py-0.5 rounded bg-[#222A3B] border border-[#2B3449]">
                        {formData.gender}
                      </span>
                    )}
                    {formData.age && <span>• {formData.age} years old</span>}
                  </div>

                  <p className="text-sm text-[#F1F2F8]/90 line-clamp-3">
                    {formData.about || "Add a bio in the form on the left to tell your developer story..."}
                  </p>

                  <div className="pt-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#A5AEC0] mb-2">
                      Core Technologies
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {parsedSkills.length > 0 ? (
                        parsedSkills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#8B83F7]/12 text-[#8B83F7] border border-[#8B83F7]/25"
                          >
                            #{skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-[#A5AEC0]/60 italic">No skills added yet</span>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Profile;
