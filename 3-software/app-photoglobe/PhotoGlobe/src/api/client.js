import axios from "axios";

// 1. Add a flag and a queue array
let isInitialized = true; // Set to true by default to allow requests to pass through
let requestQueue = [];

console.log("🚨 DEBUG 1: client.js file has loaded successfully");

// Create a configured instance of Axios
const apiClient = axios.create({
  // eslint-disable-next-line no-undef
  baseURL: "/api/v2", //import.meta.env.VITE_BASE_URL_LOCAL,
  timeout: 3000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // If initialized, let the request pass through immediately
    console.log(
      "🚨 DEBUG 2: Request interceptor triggered for URL:",
      config.url,
    );

    if (isInitialized) {
      console.log(
        "🚨 DEBUG 3: isInitialized is true, passing request through.",
      );
      return config;
    }

    // If not initialized, hold the request in a Promise
    console.log(
      "🚨 DEBUG 4: isInitialized is false, request trapped in queue.",
    );
    return new Promise((resolve) => {
      requestQueue.push(() => {
        resolve(config);
      });
    });
  },
  (error) => {
    console.log("Promise!", error);
    return Promise.reject(error);
  },
);

export const initializeAppClient = () => {
  isInitialized = true;
  // Execute and clear all queued requests
  requestQueue.forEach((callback) => callback());
  requestQueue = [];
};

// Intercept all requests immediately
/* apiClient.interceptors.request.use(
  (config) => {
    // STATE 2: Already initialized -> Let it pass through and log it
    if (isInitialized) {
      console.log(
        `Axios sending request to: ${config.baseURL || apiClient.defaults.baseURL}${config.url}`,
      );
      return config;
    }

    // STATE 1: Not initialized -> Pause the request in the queue
    return new Promise((resolve) => {
      requestQueue.push((updatedBaseUrl) => {
        config.baseURL = updatedBaseUrl; // Explicitly apply the fresh URL to the paused request
        console.log(
          `Axios flushing queued request to: ${updatedBaseUrl}${config.url}`,
        );
        resolve(config);
      });
    });
  },
  (error) => Promise.reject(error),
); */

// This interceptor grabs the base URL at the exact moment a request is fired
/* export const setupAxiosInterceptors = (apiBaseUrl) => {
  console.log("Setting Axios Base URL to:", apiBaseUrl);
  if (apiBaseUrl) {
    apiClient.defaults.baseURL = apiBaseUrl;

    isInitialized = true;
    requestQueue.forEach((cb) => cb(apiBaseUrl));
    requestQueue = []; // Clear queue

    apiClient.interceptors.request.use(
      (config) => {
        console.log(`Axios sending request to: ${config.baseURL}${config.url}`);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );
  }
}; */

/* apiClient.interceptors.response.use(
  (response) => response.data, // Directly return data, stripping Axios wrapper metadata
  (error) => {
    if (error.response?.status === 401) {
      // Handle logout or redirect to login page here
      console.error("Unauthorized! Redirecting...");
    }
    return Promise.reject(error);
  },
); */

export default apiClient;
