import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { Upload, X, } from "lucide-react";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { useQueryClient } from "@tanstack/react-query";
import useAuth from "../hooks/UseAuth";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { readRecord } from "../lib/api";

const MAX_UPLOAD_MB = 8;
const MAX_EDGE_PX = 1600;

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
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const EditSkeleton = () => (
  <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse space-y-5">
    <div className="h-8 bg-base-300 rounded w-1/3 mb-6" />
    <div className="h-12 bg-base-300 rounded" />
    <div className="h-32 bg-base-300 rounded" />
    <div className="h-12 bg-base-300 rounded" />
    <div className="h-12 bg-base-300 rounded" />
    <div className="h-40 bg-base-300 rounded" />
    <div className="h-12 bg-base-300 rounded w-1/3" />
  </div>
);

const EditIssue = () => {
  const { user, loading: authLoading } = useAuth();
  const secureApi = useAxiosSecure();
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Road",
    location: "",
    image: "",
  });

  useEffect(() => {
    if (authLoading) return; // wait for auth to resolve before checking ownership

    const fetchIssue = async () => {
      try {
        const res = await secureApi.get(`/issues/${id}`);
        const issue = readRecord(res.data, "issue");

        const ownerEmail =
          typeof issue.postedBy === "string" ? issue.postedBy : issue.postedBy?.email;

        if (!user || ownerEmail !== user.email) {
          Swal.fire({
            icon: "error",
            title: "Access Denied",
            text: "You can only edit your own issues!",
          });
          return navigate("/dashboard/my-issues");
        }

        if (issue.status !== "Pending") {
          Swal.fire({
            icon: "warning",
            title: "Cannot Edit",
            text: "You can only edit issues with Pending status.",
          });
          return navigate("/dashboard/my-issues");
        }

        setFormData({
          title: issue.title || "",
          description: issue.description || "",
          category: issue.category || "Road",
          location: issue.location || "",
          image: issue.image || "",
        });
      } catch (err) {
        console.error(err);
        Swal.fire({ icon: "error", title: "Error", text: "Failed to fetch issue data!" });
        navigate("/dashboard/my-issues");
      } finally {
        setLoading(false);
      }
    };

    fetchIssue();
  }, [id, user, authLoading, navigate, secureApi]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
      setFormData((prev) => ({ ...prev, image: compressed }));
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Couldn't process image" });
    } finally {
      setImageProcessing(false);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await secureApi.put(`/issues/${id}`, formData);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["my-issues", user?.email] }),
        queryClient.invalidateQueries({ queryKey: ["issues"] }),
      ]);
      Swal.fire({
        icon: "success",
        title: "Updated Successfully",
        text: "Issue updated successfully",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/dashboard/my-issues");
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Update Failed!",
        text: err.response?.data?.message || err.message || "Could not update issue!",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) return <EditSkeleton />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button
        onClick={() => navigate("/dashboard/my-issues")}
        className="btn btn-ghost btn-sm gap-2 mb-4"
        type="button"
      >
        ← Back to My Issues
      </button>

      <h1 className="text-3xl font-bold mb-8 text-primary text-center md:text-left">
        Edit Issue
      </h1>

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onSubmit={handleSubmit}
        className="flex flex-col gap-5"
      >
        <div>
          <label htmlFor="edit-title" className="font-medium mb-2 block">
            Issue Title
          </label>
          <input
            id="edit-title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Issue Title"
            className="input input-bordered w-full"
            disabled={submitting}
            required
          />
        </div>

        <div>
          <label htmlFor="edit-description" className="font-medium mb-2 block">
            Description
          </label>
          <textarea
            id="edit-description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            className="textarea textarea-bordered w-full min-h-[120px]"
            disabled={submitting}
            required
          />
        </div>

        <div>
          <label htmlFor="edit-category" className="font-medium mb-2 block">
            Category
          </label>
          <select
            id="edit-category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="select select-bordered w-full"
            disabled={submitting}
            required
          >
            <option>Road</option>
            <option>Garbage</option>
            <option>Water</option>
            <option>Streetlight</option>
            <option>Others</option>
          </select>
        </div>

        <div>
          <label htmlFor="edit-location" className="font-medium mb-2 block">
            Location
          </label>
          <input
            id="edit-location"
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Location"
            className="input input-bordered w-full"
            disabled={submitting}
            required
          />
        </div>

        <div>
          <label htmlFor="edit-image" className="font-medium mb-2 block">
            Issue Image
          </label>

          {formData.image ? (
            <div className="relative overflow-hidden rounded-2xl mb-3">
              <img src={formData.image} alt="Current" className="w-full h-56 object-cover" />
              <button
                type="button"
                onClick={removeImage}
                disabled={submitting}
                aria-label="Remove image"
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-base-300 rounded-2xl p-6 text-center mb-3">
              <Upload size={32} className="mx-auto text-primary mb-2" />
              <p className="text-sm opacity-70">No image attached</p>
            </div>
          )}

          <input
            id="edit-image"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={submitting || imageProcessing}
            className="file-input file-input-bordered w-full"
          />
          <p className="text-xs text-base-content/50 mt-1">
            {imageProcessing ? "Processing image..." : `Replace the image (max ${MAX_UPLOAD_MB}MB).`}
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting || imageProcessing}
          className="btn btn-primary mt-3 disabled:opacity-70"
        >
          {submitting ? "Updating..." : "Update Issue"}
        </button>
      </motion.form>
    </div>
  );
};

export default EditIssue;