import { Routes, Route, Link } from "react-router-dom";

export default function Toolbar() {
  return (
    <>
      {/* 1. Fixed App Header (Never scrolls) */}
      <header className="h-16 border-b border-slate-500 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6 z-10">
        <div className="flex flex-col space-x-3">
          {/* <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" /> */}
          <span className="text-xl font-semibold tracking-tight text-white">
            Photo Globe
          </span>
          {/* <span className="text-xs  ml-2 text-slate-300 font-mono">The most important demo app of the day...</span> */}
        </div>

        <div className="flex items-center space-x-4 text-sm text-slate-400">
          <Link
            className="px-3 py-1.5 rounded-md hover:bg-slate-800 transition"
            to="/"
          >
            Home
          </Link>
          <Link
            className="px-3 py-1.5 rounded-md hover:bg-slate-800 transition"
            to="/image"
          >
            Images
          </Link>
          <Link
            className="px-3 py-1.5 rounded-md hover:bg-slate-800 transition"
            to="/map"
          >
            Map
          </Link>
          <Link
            className="px-3 py-1.5 rounded-md hover:bg-slate-800 transition"
            to="/data"
          >
            Data
          </Link>
          <Link
            className="px-3 py-1.5 rounded-md hover:bg-slate-800 transition"
            to="/about"
          >
            About
          </Link>

          {/* <button className="px-3 py-1.5 rounded-md hover:bg-slate-800 transition">Analytics</button>
                    <button className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition">Export Data</button> */}
        </div>
      </header>
    </>
  );
}
