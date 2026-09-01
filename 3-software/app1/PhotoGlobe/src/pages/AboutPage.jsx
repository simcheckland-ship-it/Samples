import React from "react";

export default function HomePage() {
  return (
    <div className="grid h-screen w-screen  overflow-hidden">
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-700 sm:text-5xl">
            Photo Globe
          </h1>
          <p className="text-lg text-gray-600">
            A Test & Demo Application By Sim Checkland
          </p>
          <p className="text-base text-gray-500">
            <a href="mailto:sim.checkland@outlook.com">
              sim.checkland@outlook.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
