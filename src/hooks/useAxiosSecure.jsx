import { secureApi } from "../lib/api";
import { auth } from "../firebase/firebase.init";

secureApi.interceptors.request.use(
  async (config) => {
    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

const useAxiosSecure = () => secureApi;

export default useAxiosSecure;
