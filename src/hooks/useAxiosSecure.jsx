import axios from "axios";

const axiosSecure = axios.create({
  baseURL: "https://urban-fix-server.vercel.app/",
});

axiosSecure.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("access-token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

const useAxiosSecure = () => axiosSecure;

export default useAxiosSecure;