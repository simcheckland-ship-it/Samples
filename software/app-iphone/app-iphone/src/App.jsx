import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./App.css";

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      // Create a local temporary URL to display the image preview
      setPreviewUrl(URL.createObjectURL(file));
      setUploadStatus("");
    }
  };

  const reset = async () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setUploadStatus("");
  };

  const uploadImage = async (type) => {
    if (!selectedImage) {
      setUploadStatus("Please select a photo first.");
      return;
    }

    // 1. Create FormData instance
    const formData = new FormData();

    // Add type
    formData.append("type", type);

    // 2. Append the file payload ('image' must match your API key name)
    formData.append("image", selectedImage, selectedImage.name);

    setUploadStatus("Uploading...");

    try {
      // 3. Send POST request to your Web API
      const response = await fetch("https://82.8.217.2/api/v2/photos/Upload", {
        method: "POST",
        body: formData,
        // Note: Do NOT manually set Content-Type header.
        // The browser automatically sets it to multipart/form-data with the correct boundary.
      });

      if (response.ok) {
        const result = await response.json();
        setUploadStatus("Upload successful!");
        console.log("Server Response:", result);
      } else {
        setUploadStatus(`Upload failed: ${response.statusText}`);
      }

      //setUploadStatus("Upload successful!");
    } catch (error) {
      setUploadStatus("Network error occurred.");
      console.error("Error:", error);
    }
  };

  const styles = {
    container: {
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },

    uploadButton: {
      marginTop: "15px",
      backgroundColor: "#34C759",
      color: "#fff",
      border: "none",
      padding: "10px 20px",
      borderRadius: "8px",
      fontWeight: "bold",
      width: "200px",
    },

    previewContainer: {
      marginTop: "20px",
      marginBottom: "5px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },

    statusContainer: {
      marginTop: "20px",
      marginBottom: "20px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },

    previewImage: {
      maxWidth: "100%",
      maxHeight: "300px",
      borderRadius: "12px",
      objectFit: "contain",
    },
  };

  return (
    <div style={styles.container}>
      <h2>Photo Upload</h2>

      {/* Hidden native input optimized for iOS */}
      <input
        type="file"
        accept="image/*"
        id="iphone-photo-picker"
        onChange={handleImageChange}
        style={{ display: "none" }}
      />

      {/* Custom styled button for better mobile UX */}
      <label htmlFor="iphone-photo-picker" style={styles.uploadButton}>
        Open Photo Library
      </label>

      {/* Image Preview */}
      {selectedImage && (
        <>
          <div style={styles.previewContainer}>
            <img src={previewUrl} alt="Selected" style={styles.previewImage} />
          </div>
          {!uploadStatus ? (
            <>
              <label
                onClick={() => uploadImage("view")}
                style={styles.uploadButton}
              >
                Upload View
              </label>
              <label
                onClick={() => uploadImage("breakfast")}
                style={styles.uploadButton}
              >
                Upload Breakfast
              </label>
            </>
          ) : (
            <div style={styles.statusContainer}>
              {uploadStatus && <p style={styles.status}>{uploadStatus}</p>}
              <label onClick={reset} style={styles.uploadButton}>
                Reset - Select Another
              </label>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
