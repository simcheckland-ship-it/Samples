import axios from "axios";

// 1. Add a flag and a queue array
let isInitialized = false;
let requestQueue = [];

// Create a configured instance of Axios
const apiClient = axios.create({
  // eslint-disable-next-line no-undef
  baseURL: "https://api.tomtom.com/search/2/",
  timeout: 3000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// GET a single user by ID
export const getNearbySearch = () => {
  const path = "restaurant";
  return apiClient.get(`/Photos/GetPhotosByType/${id}`);
};
