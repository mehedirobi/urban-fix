import axios from "axios";

export const uploadImage = async (image) => {
  const imageHostKey = import.meta.env.VITE_image_host;

  if (!imageHostKey) {
    throw new Error("Image uploads are not configured.");
  }

  const formData = new FormData();
  formData.append("image", image);

  const response = await axios.post(
    `https://api.imgbb.com/1/upload?key=${encodeURIComponent(imageHostKey)}`,
    formData
  );
  const imageUrl = response.data?.data?.url;

  if (!response.data?.success || typeof imageUrl !== "string") {
    throw new Error("The image service did not return an image URL.");
  }

  if (imageUrl.length > 2048) {
    throw new Error("The uploaded image URL is too long for the issue service.");
  }

  return imageUrl;
};
