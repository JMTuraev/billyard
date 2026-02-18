import axios from "axios";
import { getAuth } from "firebase/auth";

/* ================= BASE URL ================= */
const api = axios.create({
  baseURL: "https://europe-west1-billyard-ae9e6.cloudfunctions.net",
});

/* ================= REQUEST INTERCEPTOR ================= */
api.interceptors.request.use(
  async (config) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE INTERCEPTOR ================= */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized — maybe session expired.");
    }

    if (error.response?.status === 500) {
      console.error("Server error:", error.response.data);
    }

    return Promise.reject(error);
  }
);

export default api;
