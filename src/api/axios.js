import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to inject the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add a global response interceptor to catch errors from the backend
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      let backendMessage = data?.message || "An unexpected error occurred";

      // Special case for our AuthController googleLogin which returns LoginResponseDto(null, errorMessage) on exception
      if (status === 403 && data && data.token === null && data.username) {
        backendMessage = data.username;
      }

      const title = data?.error || "Error";
      const originalUrl = error.config?.url;

      let details = null;

      // Parse the specific field errors mapping into an array of strings
      if (data?.fieldErrors) {
        details = Object.entries(data.fieldErrors).map(
          ([field, msg]) => `• ${field}: ${msg}`,
        );
      }

      if (status === 401) {
        // If the error comes from the login/register endpoint, it's just invalid credentials
        if (
          originalUrl &&
          (originalUrl.includes("/auth/login") ||
            originalUrl.includes("/auth/register"))
        ) {
          window.dispatchEvent(
            new CustomEvent("app-toast", {
              detail: {
                title,
                message: backendMessage,
                type: "error",
                details,
              },
            }),
          );
        } else {
          // Special case: 401 from protected routes opens the Auth Modal
          window.dispatchEvent(
            new CustomEvent("unauthorized", {
              detail: { message: backendMessage },
            }),
          );
        }
      } else {
        // All other errors (400, 403, 404, 500) show a global Toast
        window.dispatchEvent(
          new CustomEvent("app-toast", {
            detail: { title, message: backendMessage, type: "error", details },
          }),
        );
      }
    } else if (error.request) {
      // Network error (no response received)
      window.dispatchEvent(
        new CustomEvent("app-toast", {
          detail: {
            title: "Network Error",
            message: "Unable to connect to server. Please check your internet.",
            type: "warning",
          },
        }),
      );
    }
    return Promise.reject(error);
  },
);

export default api;
