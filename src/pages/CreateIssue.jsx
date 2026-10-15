import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import {
  MapPin,
  Upload,
  User,
  AlertTriangle,
  X,
  Image as ImageIcon,
  FileText,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";
import Swal from "sweetalert2";

import useAuth from "../hooks/UseAuth";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { uploadImage } from "../lib/uploadImage";

const MAX_UPLOAD_MB = 8;
const MAX_EDGE_PX = 1600;
const DESCRIPTION_MAX = 1500;
const TITLE_MAX = 120;
const LOCATION_MAX = 200;
const CATEGORY_MAX = 60;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const CATEGORIES = [
  "Road",
  "Garbage",
  "Water",
  "Streetlight",
  "Electricity",
  "Drainage",
  "Others",
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

/**
 * Resize and compress an image in the browser.
 * Returns a JPEG data URL for upload to the configured image service.
 */
const compressImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Unable to read this image."));

    reader.onload = () => {
      const img = new Image();

      img.onerror = () =>
        reject(new Error("This image could not be decoded."));

      img.onload = () => {
        try {
          const scale = Math.min(
            1,
            MAX_EDGE_PX / Math.max(img.naturalWidth, img.naturalHeight),
          );

          const width = Math.max(1, Math.round(img.naturalWidth * scale));
          const height = Math.max(1, Math.round(img.naturalHeight * scale));

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const context = canvas.getContext("2d");

          if (!context) {
            reject(new Error("Image processing is not supported."));
            return;
          }

          context.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL("image/jpeg", 0.8);

          if (!dataUrl.startsWith("data:image/jpeg;base64,")) {
            reject(new Error("Unable to compress this image."));
            return;
          }

          resolve(dataUrl);
        } catch {
          reject(new Error("Unable to process this image."));
        }
      };

      img.src = reader.result;
    };

    reader.readAsDataURL(file);
  });

const validateIssue = ({
  title,
  description,
  category,
  customCategory,
  location,
}) => {
  const errors = {};

  if (!title.trim()) {
    errors.title = "Please enter an issue title.";
  } else if (title.trim().length > TITLE_MAX) {
    errors.title = `Title must be ${TITLE_MAX} characters or fewer.`;
  }

  if (!description.trim()) {
    errors.description = "Please describe the issue.";
  } else if (description.trim().length > DESCRIPTION_MAX) {
    errors.description = `Description must be ${DESCRIPTION_MAX} characters or fewer.`;
  }

  if (!category) {
    errors.category = "Please select a category.";
  }

  if (category === "Others") {
    if (!customCategory.trim()) {
      errors.customCategory = "Please specify the issue category.";
    } else if (customCategory.trim().length > CATEGORY_MAX) {
      errors.customCategory = `Category must be ${CATEGORY_MAX} characters or fewer.`;
    }
  }

  if (!location.trim()) {
    errors.location = "Please enter the issue location.";
  } else if (location.trim().length > LOCATION_MAX) {
    errors.location = `Location must be ${LOCATION_MAX} characters or fewer.`;
  }

  return errors;
};

const FormError = ({ id, children }) => {
  if (!children) return null;

  return (
    <p id={id} role="alert" className="mt-1.5 text-sm text-error">
      {children}
    </p>
  );
};

const FieldLabel = ({ htmlFor, children, optional = false }) => (
  <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold">
    {children}
    {optional && (
      <span className="ml-2 font-normal text-base-content/45">
        (optional)
      </span>
    )}
  </label>
);

const CreateIssue = () => {
  const { user } = useAuth();
  const secureApi = useAxiosSecure();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const prefersReducedMotion = useReducedMotion();

  const fileInputRef = useRef(null);
  const imageRequestRef = useRef(0);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Road");
  const [customCategory, setCustomCategory] = useState("");
  const [location, setLocation] = useState("");

  const [image, setImage] = useState("");
  const [preview, setPreview] = useState("");
  const [imageProcessing, setImageProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const isSubmitting = false;

  const createIssueMutation = useMutation({
    mutationFn: async (newIssue) => {
      const response = await secureApi.post("/issues", newIssue);
      return response.data;
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["issues"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["my-issues", user?.email],
        }),
      ]);

      await Swal.fire({
        icon: "success",
        title: "Issue reported successfully",
        text: "Your report has been submitted.",
        confirmButtonText: "View my issues",
        confirmButtonColor: "#087f5b",
      });

      navigate("/dashboard/my-issues");
    },

    onError: async (error) => {
      console.error("Issue submission failed:", error);

      await Swal.fire({
        icon: "error",
        title: "Submission failed",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "We couldn't submit your report. Please try again.",
        confirmButtonColor: "#087f5b",
      });
    },
  });

  const setFieldError = useCallback((field, message) => {
    setErrors((previous) => ({
      ...previous,
      [field]: message,
    }));
  }, []);

  const handleImageChange = useCallback(async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const requestId = ++imageRequestRef.current;

    // Clear the previous image before processing a replacement.
    setImage("");
    setPreview("");
    setErrors((previous) => {
      const next = { ...previous };
      delete next.image;
      return next;
    });

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setFieldError(
        "image",
        "Choose a JPG, PNG, or WebP image.",
      );

      event.target.value = "";
      return;
    }

    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setFieldError(
        "image",
        `Choose an image smaller than ${MAX_UPLOAD_MB} MB.`,
      );

      event.target.value = "";
      return;
    }

    setImageProcessing(true);

    try {
      const compressedImage = await compressImage(file);
      const imageUrl = await uploadImage(compressedImage);

      // Ignore an older processing request if another image was selected.
      if (requestId !== imageRequestRef.current) return;

      setImage(imageUrl);
      setPreview(imageUrl);
    } catch (error) {
      if (requestId !== imageRequestRef.current) return;

      console.error("Image processing failed:", error);

      setFieldError(
        "image",
        error.message || "Unable to process this image. Try another file.",
      );

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      if (requestId === imageRequestRef.current) {
        setImageProcessing(false);
      }
    }
  }, [setFieldError]);

  const removeImage = useCallback(() => {
    imageRequestRef.current += 1;

    setImage("");
    setPreview("");
    setImageProcessing(false);

    setErrors((previous) => {
      const next = { ...previous };
      delete next.image;
      return next;
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (createIssueMutation.isPending || imageProcessing) return;

      if (!user?.email) {
        const result = await Swal.fire({
          icon: "warning",
          title: "Login required",
          text: "Please sign in before reporting an issue.",
          confirmButtonText: "Go to login",
          showCancelButton: true,
          cancelButtonText: "Cancel",
          confirmButtonColor: "#087f5b",
        });

        if (result.isConfirmed) {
          navigate("/login");
        }

        return;
      }

      const validationErrors = validateIssue({
        title,
        description,
        category,
        customCategory,
        location,
      });

      setErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        const firstField = Object.keys(validationErrors)[0];

        document.getElementById(`issue-${firstField}`)?.focus();
        return;
      }

      const resolvedCategory =
        category === "Others"
          ? customCategory.trim()
          : category;

      const newIssue = {
        title: title.trim(),
        description: description.trim(),
        category: resolvedCategory,
        location: location.trim(),
        image,
      };

      createIssueMutation.mutate(newIssue);
    },
    [
      user,
      title,
      description,
      category,
      customCategory,
      location,
      image,
      imageProcessing,
      createIssueMutation,
      navigate,
    ],
  );

  const busy = createIssueMutation.isPending || imageProcessing;

  const handleTextChange = (setter, field) => (event) => {
    setter(event.target.value);

    setErrors((previous) => {
      if (!previous[field]) return previous;

      const next = { ...previous };
      delete next[field];
      return next;
    });
  };

  return (
    <main className="min-h-screen bg-base-100 text-base-content">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Hero */}
        <motion.section
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative mb-8 overflow-hidden rounded-3xl bg-primary px-6 py-10 text-primary-content sm:px-10 sm:py-14"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border-[34px] border-primary-content/10"
          />

          <div className="relative z-10 max-w-3xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-content/20 bg-primary-content/10 px-3 py-1.5 text-sm font-medium">
              <MapPin size={16} aria-hidden="true" />
              Make your community better
            </span>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Report an Issue
            </h1>

            <p className="mt-4 max-w-2xl leading-7 text-primary-content/80 sm:text-lg">
              Help improve your community by reporting damaged roads, waste
              problems, water supply issues, broken streetlights, and other
              public infrastructure concerns.
            </p>
          </div>
        </motion.section>

        <div className="grid items-start gap-8 lg:grid-cols-3">
          {/* Sidebar */}
          <motion.aside
            variants={prefersReducedMotion ? undefined : containerVariants}
            initial={prefersReducedMotion ? false : "hidden"}
            animate={prefersReducedMotion ? undefined : "visible"}
            className="space-y-5 lg:sticky lg:top-6"
          >
            <motion.section
              variants={prefersReducedMotion ? undefined : fieldVariants}
              className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <User size={24} aria-hidden="true" />
              </div>

              <h2 className="text-lg font-bold">Reporter information</h2>

              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <p className="text-base-content/50">Name</p>
                  <p className="mt-1 break-words font-medium">
                    {user?.displayName || "Signed-in user"}
                  </p>
                </div>

                <div>
                  <p className="text-base-content/50">Email</p>
                  <p className="mt-1 break-all font-medium">
                    {user?.email || "Sign in to report an issue"}
                  </p>
                </div>
              </div>
            </motion.section>

            <motion.section
              variants={prefersReducedMotion ? undefined : fieldVariants}
              className="rounded-3xl border border-base-300 bg-base-200/60 p-6"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-warning/15 text-warning">
                <AlertTriangle size={24} aria-hidden="true" />
              </div>

              <h2 className="text-lg font-bold">Reporting tips</h2>

              <ul className="mt-4 space-y-3 text-sm text-base-content/70">
                {[
                  "Write a specific, descriptive title.",
                  "Provide a precise location or landmark.",
                  "Describe the problem and its impact.",
                  "Choose the closest matching category.",
                  "Upload a clear photo when possible.",
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2">
                    <CheckCircle2
                      size={17}
                      className="mt-0.5 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </motion.section>

            <div className="rounded-2xl bg-primary/5 p-5">
              <div className="flex items-start gap-3">
                <FileText
                  size={20}
                  className="mt-0.5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <p className="text-sm leading-6 text-base-content/70">
                  After submitting, you can follow your report's progress from
                  the My Issues section of your dashboard.
                </p>
              </div>
            </div>
          </motion.aside>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            noValidate
            variants={prefersReducedMotion ? undefined : containerVariants}
            initial={prefersReducedMotion ? false : "hidden"}
            animate={prefersReducedMotion ? undefined : "visible"}
            className="space-y-6 rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-8 lg:col-span-2"
          >
            <div className="border-b border-base-300 pb-5">
              <h2 className="text-2xl font-bold">Issue details</h2>
              <p className="mt-2 text-sm leading-6 text-base-content/60">
                Fill in the details below. Fields marked with an asterisk are
                required.
              </p>
            </div>

            {/* Title */}
            <motion.div variants={prefersReducedMotion ? undefined : fieldVariants}>
              <FieldLabel htmlFor="issue-title">
                Issue title <span className="text-error">*</span>
              </FieldLabel>

              <input
                id="issue-title"
                name="title"
                type="text"
                placeholder="e.g. Broken streetlight near the main road"
                value={title}
                onChange={handleTextChange(setTitle, "title")}
                maxLength={TITLE_MAX}
                required
                disabled={busy}
                aria-invalid={Boolean(errors.title)}
                aria-describedby={errors.title ? "title-error" : "title-count"}
                className={`input input-bordered w-full bg-base-100 ${
                  errors.title ? "input-error" : ""
                }`}
              />

              <div className="mt-1 flex justify-between gap-3">
                <FormError id="title-error">{errors.title}</FormError>
                <span
                  id="title-count"
                  className="ml-auto shrink-0 text-xs text-base-content/45"
                >
                  {title.length}/{TITLE_MAX}
                </span>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div variants={prefersReducedMotion ? undefined : fieldVariants}>
              <FieldLabel htmlFor="issue-description">
                Description <span className="text-error">*</span>
              </FieldLabel>

              <textarea
                id="issue-description"
                name="description"
                placeholder="Describe what happened, where it occurred, and how it affects the community..."
                value={description}
                onChange={handleTextChange(setDescription, "description")}
                maxLength={DESCRIPTION_MAX}
                required
                disabled={busy}
                aria-invalid={Boolean(errors.description)}
                aria-describedby={
                  errors.description
                    ? "description-error description-count"
                    : "description-count"
                }
                className={`textarea textarea-bordered min-h-40 w-full resize-y bg-base-100 leading-7 ${
                  errors.description ? "textarea-error" : ""
                }`}
              />

              <div className="mt-1 flex justify-between gap-3">
                <FormError id="description-error">
                  {errors.description}
                </FormError>
                <span
                  id="description-count"
                  className="ml-auto shrink-0 text-xs text-base-content/45"
                  aria-live="polite"
                >
                  {description.length}/{DESCRIPTION_MAX}
                </span>
              </div>
            </motion.div>

            {/* Category and service-assigned priority */}
            <motion.div
              variants={prefersReducedMotion ? undefined : fieldVariants}
              className="grid gap-5 sm:grid-cols-2"
            >
              <div>
                <FieldLabel htmlFor="issue-category">
                  Category <span className="text-error">*</span>
                </FieldLabel>

                <select
                  id="issue-category"
                  name="category"
                  value={category}
                  onChange={(event) => {
                    setCategory(event.target.value);
                    setErrors((previous) => {
                      const next = { ...previous };
                      delete next.category;
                      delete next.customCategory;
                      return next;
                    });
                  }}
                  disabled={busy}
                  aria-invalid={Boolean(errors.category)}
                  aria-describedby={
                    errors.category ? "category-error" : undefined
                  }
                  className={`select select-bordered w-full bg-base-100 ${
                    errors.category ? "select-error" : ""
                  }`}
                >
                  {CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <FormError id="category-error">
                  {errors.category}
                </FormError>

                {category === "Others" && (
                  <div className="mt-3">
                    <FieldLabel htmlFor="issue-customCategory">
                      Specify category <span className="text-error">*</span>
                    </FieldLabel>

                    <input
                      id="issue-customCategory"
                      name="customCategory"
                      type="text"
                      placeholder="Enter the category"
                      value={customCategory}
                      onChange={handleTextChange(
                        setCustomCategory,
                        "customCategory",
                      )}
                      maxLength={CATEGORY_MAX}
                      required
                      disabled={busy}
                      aria-invalid={Boolean(errors.customCategory)}
                      aria-describedby={
                        errors.customCategory
                          ? "customCategory-error"
                          : undefined
                      }
                      className={`input input-bordered w-full bg-base-100 ${
                        errors.customCategory ? "input-error" : ""
                      }`}
                    />

                    <FormError id="customCategory-error">
                      {errors.customCategory}
                    </FormError>
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-center rounded-xl border border-base-300 bg-base-200/40 p-4">
                <span className="text-sm font-semibold">Priority</span>
                <span className="mt-2 badge badge-outline w-fit">Normal</span>
                <p className="mt-2 text-xs leading-5 text-base-content/50">
                  The API assigns Normal priority to new reports. Priority
                  selection is not supported by the service.
                </p>
              </div>
            </motion.div>

            {/* Location */}
            <motion.div variants={prefersReducedMotion ? undefined : fieldVariants}>
              <FieldLabel htmlFor="issue-location">
                Location <span className="text-error">*</span>
              </FieldLabel>

              <div className="relative">
                <MapPin
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40"
                  aria-hidden="true"
                />

                <input
                  id="issue-location"
                  name="location"
                  type="text"
                  placeholder="Street, area, landmark, or address"
                  value={location}
                  onChange={handleTextChange(setLocation, "location")}
                  maxLength={LOCATION_MAX}
                  required
                  disabled={busy}
                  aria-invalid={Boolean(errors.location)}
                  aria-describedby={
                    errors.location ? "location-error" : undefined
                  }
                  className={`input input-bordered w-full bg-base-100 pl-11 ${
                    errors.location ? "input-error" : ""
                  }`}
                />
              </div>

              <FormError id="location-error">{errors.location}</FormError>

              <p className="mt-1.5 text-xs text-base-content/50">
                Include a nearby landmark to help the responsible team find
                the issue.
              </p>
            </motion.div>

            {/* Image upload */}
            <motion.div variants={prefersReducedMotion ? undefined : fieldVariants}>
              <FieldLabel htmlFor="issue-image" optional>
                Issue photo
              </FieldLabel>

              <div className="rounded-2xl border-2 border-dashed border-base-300 bg-base-200/40 p-4 sm:p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    {imageProcessing ? (
                      <LoaderCircle
                        size={28}
                        className="animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <ImageIcon size={28} aria-hidden="true" />
                    )}
                  </div>

                  <p className="font-semibold">
                    {imageProcessing
                      ? "Processing your photo..."
                      : "Add a photo of the issue"}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-base-content/55">
                    JPG, PNG, or WebP. Maximum {MAX_UPLOAD_MB} MB before
                    compression.
                  </p>

                  <input
                    id="issue-image"
                    ref={fileInputRef}
                    name="image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    disabled={busy}
                    aria-invalid={Boolean(errors.image)}
                    aria-describedby={
                      errors.image ? "image-error" : "image-help"
                    }
                    className="file-input file-input-bordered mt-4 w-full max-w-sm bg-base-100"
                  />

                  <span id="image-help" className="sr-only">
                    Optional image attachment for your issue report.
                  </span>

                  <FormError id="image-error">{errors.image}</FormError>

                  {image && (
                    <p className="mt-3 flex items-center gap-2 text-sm text-success">
                      <CheckCircle2 size={16} aria-hidden="true" />
                      Photo ready to upload
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Preview */}
            {preview && (
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-2xl border border-base-300"
              >
                <div className="flex items-center justify-between gap-3 border-b border-base-300 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <ImageIcon
                      size={17}
                      className="text-primary"
                      aria-hidden="true"
                    />
                    Image preview
                  </div>

                  <button
                    type="button"
                    onClick={removeImage}
                    disabled={busy}
                    className="btn btn-ghost btn-sm gap-1 text-error"
                    aria-label="Remove selected image"
                  >
                    <X size={16} aria-hidden="true" />
                    Remove
                  </button>
                </div>

                <img
                  src={preview}
                  alt="Preview of the selected issue"
                  className="max-h-96 w-full bg-base-200 object-contain"
                />
              </motion.div>
            )}

            {/* Submission error */}
            {createIssueMutation.isError && (
              <div
                role="alert"
                className="rounded-xl border border-error/25 bg-error/5 p-4 text-sm"
              >
                <p className="font-semibold text-error">
                  We couldn't submit your report.
                </p>
                <p className="mt-1 text-base-content/70">
                  Check your connection and try again. Your entered details
                  are still available in the form.
                </p>
              </div>
            )}

            {/* Submit */}
            <motion.div variants={prefersReducedMotion ? undefined : fieldVariants}>
              <button
                type="submit"
                disabled={busy}
                className="btn btn-primary min-h-12 w-full rounded-xl text-base"
              >
                {isSubmitting || createIssueMutation.isPending ? (
                  <>
                    <LoaderCircle
                      size={19}
                      className="animate-spin"
                      aria-hidden="true"
                    />
                    Submitting report...
                  </>
                ) : imageProcessing ? (
                  <>
                    <LoaderCircle
                      size={19}
                      className="animate-spin"
                      aria-hidden="true"
                    />
                    Processing image...
                  </>
                ) : (
                  <>
                    <Upload size={19} aria-hidden="true" />
                    Submit Issue
                  </>
                )}
              </button>

              <p className="mt-3 text-center text-xs leading-5 text-base-content/50">
                By submitting, you confirm that the information provided is
                accurate to the best of your knowledge.
              </p>
            </motion.div>
          </motion.form>
        </div>
      </div>
    </main>
  );
};

export default CreateIssue;