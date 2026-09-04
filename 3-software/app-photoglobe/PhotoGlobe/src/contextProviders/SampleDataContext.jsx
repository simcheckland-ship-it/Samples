import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Import the JSON data from src folder
import itemsData from '../sampleData/metadata.json';

const SampleDataContext = createContext(null);

export function SampleDataProvider({ children }) {
    const [sampleData, setSampleData] = useState(itemsData);

   const findItem = (itemId) => {
        // Optional chaining (?.) ensures this returns undefined instead of crashing if data is null
        return sampleData?.find((item) => item.fileName === itemId);
    };

    const getDefaultItem = () => {
        // Returns null if data hasn't loaded yet, otherwise returns the first item
        return (sampleData && sampleData.length > 0) ? sampleData[0] : null;
    }

    return (
        <SampleDataContext.Provider value={{ sampleData, findItem, getDefaultItem }}>
            {children}
        </SampleDataContext.Provider>
    )
}

export function useSampleData() {
    const context = useContext(SampleDataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}

