import { useState } from "react";
import MapPage from "./pages/MapPage.jsx";
import ImagePage from "./pages/ImagePage.jsx";
import HomePage from "./pages/HomePage.jsx";
import DataPage from "./pages/DataPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import "./index.css";
import Toolbar from "./components/ToolBar.jsx";
import { Routes, Route, Link } from "react-router-dom";
import { AppStateProvider } from "./contextProviders/AppStateContext.jsx";
import { APIProvider } from "@vis.gl/react-google-maps";

function App() {
  // Simple Page Components
  const Home = () => <h2>🏠 Home Page</h2>;
  const About = () => <h2>ℹ️ About Page</h2>;
  const Contact = () => <h2>📞 Contact Page</h2>;
  const NotFound = () => <h2>⚠️ 404 - Page Not Found</h2>;

  return (
    /* Outer Application Shell: Locked exactly to the window dimensions. No global scrolling. */
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-950 text-slate-100 antialiased">
      <Toolbar />

      <AppStateProvider>
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_KEY}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/image" element={<ImagePage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/data" element={<DataPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </APIProvider>
      </AppStateProvider>
    </div>
  );
}

export default App;
