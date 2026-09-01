import apiClient from "./client.js";

// GET all users
export const getPhotos = () => {
  return apiClient.get("Photos");
};

// GET photos by type
export const getPhotosByType = (type) => {
  return apiClient.get(`Photos/GetPhotosByType/${type}`);
};
