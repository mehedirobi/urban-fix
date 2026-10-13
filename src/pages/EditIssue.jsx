import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { Upload, X, Image as ImageIcon, LoaderCircle } from "lucide-react";
import { HiOutlineArrowLeft } from "react-icons/hi";

import useAuth from "../hooks/UseAuth";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { readRecord } from "../lib/api";

const MAX_UPLOAD_MB = 8;
const MAX_EDGE_PX = 1600;
const DESCRIPTION_MAX = 1500;
const TITLE_MAX = 120;
const LOCATION_MAX = 200;

const ISSUE_CATEGORIES = [
  "Road",
  "Garbage",
  "Water",
  "Streetlight",
  "Electricity",
  "Drainage",
  "Others",
];

const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

const compressImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Unable to read the selected image."));

    reader.onload = () => {
      const image = new Image();

      image.onerror = () =>
        reject(new Error("The selected file is not a valid image."));

      image.onload = () => {
        try {
          if (!image.naturalWidth || !image.naturalHeight) {
            reject(new Error("The selected image has invalid dimensions."));
            return;
          }

          const scale = Math.min(
            1,
            MAX_EDGE_PX / image.naturalWidth,
            MAX_EDGE_PX / image.naturalHeight,
          );

          const width = Math.max(
            1,
            Math.round(image.naturalWidth * scale),
          );

          const height = Math.max(
            1,
            Math.round(image.naturalHeight * scale),
          );

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const context = canvas.getContext("2d");

          if (!context) {
            reject(new Error("Image processing is not supported by this browser."));
            return;
          }

          context.drawImage(image, 0, 0, width, height);

          const compressedImage = canvas.toDataURL("image/jpeg", 0.8);

          if (!compressedImage.startsWith("data:image/jpeg;base64,")) {
            reject(new Error("Could not compress this image. Please try another file."));
            return;
          }

          resolve(compressedImage);
        } catch {
          reject(new Error("An error occurred while processing the image."));
        }
      };

      image.src = reader.result;
    };

    reader.readAsDataURL(file);
  });

const EditSkeleton = () => (
  <div
    className="mx-auto max-w-3xl space-y-5 px-4 py-10"
    role="status"
    aria-label="Loading issue details"
  >
    <div className="mb-6 h-8 w-1/3 animate-pulse rounded bg-base-300" />
    <div className="h-12 animate-pulse rounded bg-base-300" />
    <div className="h-32 animate-pulse rounded bg-base-300" />
    <div className="h-12 animate-pulse rounded bg-base-300" />
    <div className="h-12 animate-pulse rounded bg-base-300" />
    <div className="h-40 animate-pulse rounded bg-base-300" />
    <div className="h-12 w-1/3 animate-pulse rounded bg-base-300" />
    <span className="sr-only">Loading issue details...</span>
  </div>
);

const EditIssue = () => {
  const { user, loading: authLoading } = useAuth();
  const secureApi = useAxiosSecure();
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const reducedMotion = useReducedMotion();

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

  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (authLoading) return undefined;

    let cancelled = false;

    const redirectToMyIssues = async (options) => {
      await Swal.fire(options);

      if (!cancelled) {
        navigate("/dashboard/my-issues", { replace: true });
      }
    };

    const fetchIssue = async () => {
      setLoading(true);
      setLoadError(false);

      if (!user?.email) {
        await redirectToMyIssues({
          icon: "warning",
          title: "Login Required",
          text: "Please log in to edit an issue.",
          confirmButtonText: "OK",
        });

        return;
      }

      if (!id) {
        await redirectToMyIssues({
          icon: "error",
          title: "Invalid Issue",
          text: "The issue ID is missing or invalid.",
        });

        return;
      }

      try {
        const response = await secureApi.get(
          `/issues/${encodeURIComponent(id)}`,
        );

        if (cancelled) return;

        const issue = readRecord(response.data, "issue");

        if (!issue || typeof issue !== "object") {
          throw new Error("Issue details were not found.");
        }

        const ownerEmail =
          typeof issue.postedBy === "string"
            ? issue.postedBy
            : issue.postedBy?.email;

        if (
          !ownerEmail ||
          ownerEmail.toLowerCase() !== user.email.toLowerCase()
        ) {
          await redirectToMyIssues({
            icon: "error",
            title: "Access Denied",
            text: "You can only edit your own issues.",
            confirmButtonText: "Go Back",
          });

          return;
        }

        if (issue.status !== "Pending") {
          await redirectToMyIssues({
            icon: "warning",
            title: "Cannot Edit Issue",
            text: "Only issues with Pending status can be edited.",
            confirmButtonText: "Go Back",
          });

          return;
        }

        setFormData({
          title: issue.title ?? "",
          description: issue.description ?? "",
          category: issue.category ?? "Road",
          location: issue.location ?? "",
          image: issue.image ?? "",
        });
      } catch (error) {
        if (cancelled) return;

        console.error("Failed to load issue:", error);
        setLoadError(true);

        await redirectToMyIssues({
          icon: "error",
          title: "Unable to Load Issue",
          text:
            error.response?.data?.message ||
            "Could not load this issue. It may have been removed or you may not have permission to access it.",
          confirmButtonText: "Go Back",
        });
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchIssue();

    return () => {
      cancelled = true;
    };
  }, [id, user?.email, authLoading, secureApi, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      await Swal.fire({
        icon: "error",
        title: "Invalid File",
        text: "Please select a valid image file.",
      });

      event.target.value = "";
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      await Swal.fire({
        icon: "error",
        title: "File Too Large",
        text: `Choose an image smaller than ${MAX_UPLOAD_MB} MB.`,
      });

      event.target.value = "";
      return;
    }

    setImageProcessing(true);

    try {
      const compressedImage = await compressImage(file);

      setFormData((previous) => ({
        ...previous,
        image: compressedImage,
      }));
    } catch (error) {
      console.error("Image processing failed:", error);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await Swal.fire({
        icon: "error",
        title: "Image Processing Failed",
        text:
          error.message ||
          "Could not process the image. Please try another image.",
      });
    } finally {
      setImageProcessing(false);
    }
  };

  const removeImage = () => {
    setFormData((previous) => ({
      ...previous,
      image: "",
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting || imageProcessing) return;

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category.trim(),
      location: formData.location.trim(),
      image: formData.image,
    };

    if (
      !payload.title ||
      !payload.description ||
      !payload.category ||
      !payload.location
    ) {
      await Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please complete all required fields.",
      });

      return;
    }

    if (payload.title.length > TITLE_MAX) {
      await Swal.fire({
        icon: "warning",
        title: "Title Too Long",
        text: `Keep the title within ${TITLE_MAX} characters.`,
      });

      return;
    }

    if (payload.description.length > DESCRIPTION_MAX) {
      await Swal.fire({
        icon: "warning",
        title: "Description Too Long",
        text: `Keep the description within ${DESCRIPTION_MAX} characters.`,
      });

      return;
    }

    if (payload.location.length > LOCATION_MAX) {
      await Swal.fire({
        icon: "warning",
        title: "Location Too Long",
        text: `Keep the location within ${LOCATION_MAX} characters.`,
      });

      return;
    }

    setSubmitting(true);

    try {
      await secureApi.put(`/issues/${encodeURIComponent(id)}`, payload);

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["my-issues", user?.email],
        }),
        queryClient.invalidateQueries({
          queryKey: ["issues"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["issue", id],
        }),
      ]);

      await Swal.fire({
        icon: "success",
        title: "Issue Updated",
        text: "Your changes have been saved successfully.",
        timer: 1800,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      navigate("/dashboard/my-issues", { replace: true });
    } catch (error) {
      console.error("Issue update failed:", error);

      await Swal.fire({
        icon: "error",
        title: "Update Failed",
        text:
          error.response?.data?.message ||
          "Could not update this issue. Please try again.",
        confirmButtonText: "OK",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return <EditSkeleton />;
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="text-xl font-semibold">Unable to load issue</h1>
        <p className="mt-2 text-base-content/70">
          Return to your issues and try again.
        </p>
        <button
          type="button"
          onClick={() => navigate("/dashboard/my-issues")}
          className="btn btn-primary mt-5"
        >
          Back to My Issues
        </button>
      </div>
    );
  }

  const knownCategories = ISSUE_CATEGORIES.includes(formData.category)
    ? ISSUE_CATEGORIES
    : [...ISSUE_CATEGORIES, formData.category];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <button
        type="button"
        onClick={() => navigate("/dashboard/my-issues")}
        className="btn btn-ghost btn-sm mb-5 gap-2"
      >
        <HiOutlineArrowLeft size={18} />
        Back to My Issues
      </button>

      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Issue Management
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Edit Issue
        </h1>
        <p className="mt-2 text-base-content/70">
          Update the information so your community can better understand the
          issue.
        </p>
      </div>

      <motion.form
        initial={reducedMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.3 }}
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-8"
      >
        <div>
          <label htmlFor="edit-title" className="mb-2 block font-medium">
            Issue Title <span className="text-error">*</span>
          </label>
          <input
            id="edit-title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Damaged road near the market"
            maxLength={TITLE_MAX}
            className="input input-bordered w-full focus:outline-primary"
            disabled={submitting || imageProcessing}
            autoComplete="off"
            required
          />
          <p className="mt-1 text-right text-xs text-base-content/60">
            {formData.title.length}/{TITLE_MAX}
          </p>
        </div>

        <div>
          <label
            htmlFor="edit-description"
            className="mb-2 block font-medium"
          >
            Description <span className="text-error">*</span>
          </label>
          <textarea
            id="edit-description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the issue, its impact, and any useful details..."
            maxLength={DESCRIPTION_MAX}
            rows={5}
            className="textarea textarea-bordered min-h-32 w-full focus:outline-primary"
            disabled={submitting || imageProcessing}
            required
          />
          <p className="mt-1 text-right text-xs text-base-content/60">
            {formData.description.length}/{DESCRIPTION_MAX}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="edit-category" className="mb-2 block font-medium">
              Category <span className="text-error">*</span>
            </label>
            <select
              id="edit-category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="select select-bordered w-full focus:outline-primary"
              disabled={submitting || imageProcessing}
              required
            >
              {knownCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="edit-location" className="mb-2 block font-medium">
              Location <span className="text-error">*</span>
            </label>
            <input
              id="edit-location"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Area, road, or nearby landmark"
              maxLength={LOCATION_MAX}
              className="input input-bordered w-full focus:outline-primary"
              disabled={submitting || imageProcessing}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="edit-image" className="mb-2 block font-medium">
            Issue Image
            <span className="ml-2 text-sm font-normal text-base-content/60">
              (Optional)
            </span>
          </label>

          {formData.image ? (
            <div className="relative mb-4 overflow-hidden rounded-2xl border border-base-300">
              <img
                src={formData.image}
                alt="Issue preview"
                className="max-h-80 min-h-40 w-full bg-base-200 object-contain"
              />

              <button
                type="button"
                onClick={removeImage}
                disabled={submitting || imageProcessing}
                aria-label="Remove issue image"
                title="Remove image"
                className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-neutral/80 text-neutral-content transition hover:bg-neutral disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>
          ) : (
            <div className="mb-4 rounded-2xl border-2 border-dashed border-base-300 bg-base-200/30 px-5 py-8 text-center">
              {imageProcessing ? (
                <LoaderCircle
                  size={32}
                  className="mx-auto mb-3 animate-spin text-primary"
                />
              ) : (
                <ImageIcon
                  size={32}
                  className="mx-auto mb-3 text-base-content/50"
                />
              )}

              <p className="font-medium">
                {imageProcessing ? "Processing image..." : "No image attached"}
              </p>
              <p className="mt-1 text-sm text-base-content/60">
                Select an image to attach it to this issue.
              </p>
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

          <p className="mt-2 text-xs text-base-content/60">
            Upload an image up to {MAX_UPLOAD_MB} MB. Images are resized and
            compressed before submission.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-base-300 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate("/dashboard/my-issues")}
            disabled={submitting || imageProcessing}
            className="btn btn-ghost"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting || imageProcessing}
            className="btn btn-primary min-w-40 gap-2"
          >
            {submitting ? (
              <>
                <span className="loading loading-spinner loading-sm" />
                Updating...
              </>
            ) : imageProcessing ? (
              <>
                <span className="loading loading-spinner loading-sm" />
                Processing Image...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default EditIssue;