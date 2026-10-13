import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { MapPin, Upload, User, AlertTriangle, X } from "lucide-react";
import Swal from "sweetalert2";
import useAuth from "../hooks/UseAuth";
import useAxiosSecure from "../hooks/useAxiosSecure";

const MAX_UPLOAD_MB = 8;
const MAX_EDGE_PX = 1600;
const DESCRIPTION_MAX = 1500;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

// Resize + compress in-browser so payloads stay small regardless of source photo size
const compressImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > MAX_EDGE_PX) {
          height = Math.round((height * MAX_EDGE_PX) / width);
          width = MAX_EDGE_PX;
        } else if (height > MAX_EDGE_PX) {
          width = Math.round((width * MAX_EDGE_PX) / height);
          height = MAX_EDGE_PX;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const CreateIssue = () => {
  const { user } = useAuth();
  const secureApi = useAxiosSecure();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const prefersReducedMotion = useReducedMotion();
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Road");
  const [customCategory, setCustomCategory] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState("");
  const [preview, setPreview] = useState("");
  const [imageProcessing, setImageProcessing] = useState(false);

  const createIssueMutation = useMutation({
    mutationFn: async (newIssue) => {
      const res = await secureApi.post("/issues", newIssue);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-issues", user?.email] });
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      Swal.fire({
        icon: "success",
        title: "Issue Reported",
        text: "Your issue has been submitted successfully.",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/dashboard/my-issues");
    },
    onError: (err) => {
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: err.response?.data?.message || err.message || "Something went wrong.",
      });
    },
  });

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      Swal.fire({ icon: "error", title: "Invalid file", text: "Please select an image file." });
      e.target.value = "";
      return;
    }

    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "File too large",
        text: `Please choose an image under ${MAX_UPLOAD_MB}MB.`,
      });
      e.target.value = "";
      return;
    }

    try {
      setImageProcessing(true);
      const compressed = await compressImage(file);
      setImage(compressed);
      setPreview(compressed);
    } catch (err) {
      console.error("Image processing failed:", err);
      Swal.fire({ icon: "error", title: "Couldn't process image", text: "Please try a different file." });
    } finally {
      setImageProcessing(false);
    }
  };

  const removeImage = () => {
    setImage("");
    setPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!user) {
      Swal.fire({ icon: "warning", title: "Login Required", text: "Please login first." });
      return;
    }

    const resolvedCategory = category === "Others" ? customCategory.trim() || "Others" : category;

    const newIssue = {
      title: title.trim(),
      description: description.trim(),
      category: resolvedCategory,
      priority,
      location: location.trim(),
      image,
      postedBy: {
        email: user.email,
        name: user.displayName || "User",
        photoURL: user.photoURL || "",
      },
      status: "Pending",
      upvotes: 0,
      upvotedUsers: [],
      timeline: [
        {
          status: "Pending",
          message: "Issue reported by citizen",
          updatedBy: user.email,
          date: new Date(),
        },
      ],
    };

    createIssueMutation.mutate(newIssue);
  };

  const isSubmitting = createIssueMutation.isPending;

  return (
    <div className="bg-base-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl bg-gradient-to-r from-primary to-secondary text-white p-8 md:p-12 mb-10"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Report Urban Issues</h1>
          <p className="max-w-3xl text-white/90 text-base md:text-lg">
            Help improve your community by reporting infrastructure problems, road
            damage, water supply issues, waste management concerns, and public service
            failures.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <motion.div
            variants={prefersReducedMotion ? undefined : containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div variants={fieldVariants} className="bg-base-200 rounded-3xl p-6 shadow-sm">
              <User className="text-primary mb-3" size={28} />
              <h3 className="text-xl font-bold mb-4">Reporter Information</h3>
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">Name:</span> {user?.displayName || "User"}
                </p>
                <p className="break-all">
                  <span className="font-semibold">Email:</span> {user?.email}
                </p>
              </div>
            </motion.div>

            <motion.div variants={fieldVariants} className="bg-base-200 rounded-3xl p-6 shadow-sm">
              <AlertTriangle className="text-warning mb-3" size={28} />
              <h3 className="text-xl font-bold mb-4">Reporting Tips</h3>
              <ul className="space-y-3 text-sm opacity-80">
                <li>• Use a clear and specific title.</li>
                <li>• Add an exact location.</li>
                <li>• Upload a quality image.</li>
                <li>• Explain the issue clearly.</li>
                <li>• Select correct category.</li>
              </ul>
            </motion.div>
          </motion.div>

          {/* Form */}
          <div className="lg:col-span-2">
            <motion.form
              onSubmit={handleSubmit}
              variants={prefersReducedMotion ? undefined : containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-base-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6"
            >
              {/* Title */}
              <motion.div variants={fieldVariants}>
                <label htmlFor="issue-title" className="font-medium mb-2 block">
                  Issue Title
                </label>
                <input
                  id="issue-title"
                  type="text"
                  placeholder="Broken Streetlight Near Main Road"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="input input-bordered w-full"
                />
              </motion.div>

              {/* Description */}
              <motion.div variants={fieldVariants}>
                <label htmlFor="issue-description" className="font-medium mb-2 block">
                  Description
                </label>
                <textarea
                  id="issue-description"
                  placeholder="Describe the issue in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={DESCRIPTION_MAX}
                  required
                  disabled={isSubmitting}
                  className="textarea textarea-bordered min-h-[160px] w-full"
                />
                <p className="text-xs text-base-content/50 mt-1 text-right">
                  {description.length}/{DESCRIPTION_MAX}
                </p>
              </motion.div>

              {/* Category + Priority */}
              <motion.div variants={fieldVariants} className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="issue-category" className="font-medium mb-2 block">
                    Category
                  </label>
                  <select
                    id="issue-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={isSubmitting}
                    className="select select-bordered w-full"
                  >
                    <option>Road</option>
                    <option>Garbage</option>
                    <option>Water</option>
                    <option>Streetlight</option>
                    <option>Electricity</option>
                    <option>Drainage</option>
                    <option>Others</option>
                  </select>
                  {category === "Others" && (
                    <input
                      type="text"
                      placeholder="Specify category"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      disabled={isSubmitting}
                      className="input input-bordered w-full mt-2"
                    />
                  )}
                </div>

                <div>
                  <label htmlFor="issue-priority" className="font-medium mb-2 block">
                    Priority
                  </label>
                  <select
                    id="issue-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    disabled={isSubmitting}
                    className="select select-bordered w-full"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </motion.div>

              {/* Location */}
              <motion.div variants={fieldVariants}>
                <label htmlFor="issue-location" className="font-medium mb-2 block">
                  Location
                </label>
                <div className="relative">
                  <MapPin
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40"
                  />
                  <input
                    id="issue-location"
                    type="text"
                    placeholder="Enter exact location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="input input-bordered w-full pl-12"
                  />
                </div>
              </motion.div>

              {/* Upload */}
              <motion.div variants={fieldVariants}>
                <label htmlFor="issue-image" className="font-medium mb-3 block">
                  Upload Image
                </label>

                <div className="border-2 border-dashed border-base-300 rounded-2xl p-6 text-center">
                  <Upload size={40} className="mx-auto text-primary mb-3" />
                  <input
                    id="issue-image"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isSubmitting || imageProcessing}
                    className="file-input file-input-bordered w-full"
                  />
                  <p className="text-sm opacity-70 mt-3">
                    {imageProcessing
                      ? "Processing image..."
                      : `Upload a clear image of the issue (max ${MAX_UPLOAD_MB}MB).`}
                  </p>
                </div>
              </motion.div>

              {/* Preview */}
              {preview && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative overflow-hidden rounded-2xl"
                >
                  <img src={preview} alt="Preview" className="w-full h-72 object-cover" />
                  <button
                    type="button"
                    onClick={removeImage}
                    disabled={isSubmitting}
                    aria-label="Remove image"
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </motion.div>
              )}

              {/* Submit */}
              <motion.button
                variants={fieldVariants}
                type="submit"
                disabled={isSubmitting || imageProcessing}
                className="btn btn-primary btn-lg w-full disabled:opacity-70"
              >
                {isSubmitting ? "Submitting..." : "Submit Issue"}
              </motion.button>
            </motion.form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateIssue;