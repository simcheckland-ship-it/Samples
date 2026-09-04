import React from "react";
import { useState, useEffect } from "react";
import ImageList from "../components/ImageList.jsx";
import Image from "../components/Image.jsx";
import { useAppState } from "../hooks/useAppState.js";

export default function ImagePage() {
  const { activeItem, setActiveItem, photos, loading, error } = useAppState();

  //const [ activeItem, setActiveItem ] = useState(() => getDefaultItem());

  // const handleItemChange  = (itemId) => {
  //   const itemData = findItem(itemId);
  //   if (!itemData) {
  //     console.warn(`Item with ID "${itemId}" was not found.`);
  //     setActiveItem(null);
  //     return;
  //   }
  //   setActiveItem(itemData);

  //   // You can also trigger side effects here
  //   console.log(`Navigation changed to: ${itemId}`);
  // };

  useEffect(() => {
    if (loading) return;

    if (photos && photos.length > 0 && !activeItem) {
      setActiveItem(photos[0]); // Pick the first user automatically
    }
  }, [photos, activeItem, loading]); // Triggers immediately when 'users' loads into memory

  return (
    <>
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Panel: Fixed width, interior scrolling only */}
        <aside className="w-80 border-r border-slate-800 bg-slate-900 flex flex-col overflow-hidden">
          <ImageList
            appData={photos}
            activeItem={activeItem}
            setActiveItem={setActiveItem}
            loading={loading}
          />
        </aside>

        {/* 3. The Blank Map Canvas Area */}
        {/* 'flex-1' allows it to stretch to the right browser wall dynamically */}
        <main className=" z-0 flex-1 h-full overflow-hidden relative flex flex-col items-center justify-center p-4">
          <div className="absolute inset-0 z-10 bg-[linear-gradient(to_right,rgba(16,185,129,0.5)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.5)_1px,transparent_1px)] bg-size-[64px_64px]" />
          <div className="z-10 border border-emerald-500/50 rounded-xl flex flex-col items-center justify-center  h-full overflow-hidden">
            {activeItem ? (
              <Image
                fileName={activeItem.fileName}
                label={activeItem.fileName}
              />
            ) : (
              ""
            )}
          </div>
        </main>
      </div>
    </>
  );
}
