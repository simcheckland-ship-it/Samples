import React from 'react';
import { useSampleData } from '../contextProviders/SampleDataContext.jsx';
import { useAppState } from '../contextProviders/AppStateContext.jsx';

import IconImage from './IconImage.jsx';

export default function ImageList() {
  const { activeItem, setActiveItem } = useAppState();
  const { sampleData } = useSampleData();
  
 
 
  return (
    <>
      {/* Static Sidebar Title Header */}
      <div className="p-4 border-b border-slate-800">
        <h2 className="font-medium text-slate-200">Data Layers</h2>
        <p className="text-xs text-slate-500 mt-0.5">Select a layer to re-center the workspace view.</p>
      </div>

  {sampleData && sampleData.length > 0 ? (
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {sampleData.map((item) => {
            // 3. Safe optional chaining to prevent runtime crashes if activeItem is null
            const isActive = activeItem?.FileName === item.FileName;

            return (
              <button
                key={item.FileName}
                onClick={() => setActiveItem(item)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all block group ${
                  isActive
                    ? 'bg-slate-800/80 border-emerald-500/50 shadow-lg shadow-emerald-950/20'
                    : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Thumbnail Wrapper */}
                  <div className="w-14 h-14 shrink-0 rounded-md overflow-hidden bg-slate-800 border border-slate-700/50">
                    <IconImage fileName={item.FileName} label={item.FileName} />
                  </div>

                  {/* 4. Text Content Container with layout safety wrapper */}
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm text-slate-200 group-hover:text-white block truncate">
                      {item.FileName}
                    </span>
                    
                    <div className="text-xs text-slate-500 mt-2 flex items-center space-x-1 font-mono">
                      <span>Size:</span>
                      <span className="text-slate-400">{item.ImageSize}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        /* Empty State Fallback */
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-sm text-slate-500 font-mono">No data items available.</p>
        </div>
      )}



      {/* Static Sidebar Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-xs text-slate-500">
        System Status: Nominal
      </div>

    </>
  )

}
