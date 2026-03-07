import React, { createContext, useContext, useEffect, useState } from "react";
import { LoadScript } from "@react-google-maps/api";

const MapsContext = createContext({ isLoaded: false });

export function useMaps() {
  return useContext(MapsContext);
}

// Load once with ALL libraries needed across the whole app
const LIBRARIES = ["places"];

export function MapsProvider({ children }) {
  const [apiKey, setApiKey] = useState(null); // null = still fetching

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then(({ googleMapsApiKey }) => setApiKey(googleMapsApiKey || ""))
      .catch(() => setApiKey(""));
  }, []);

  // Still fetching key — render children without map support
  if (apiKey === null) return children;

  // No key configured — render children without map support
  if (apiKey === "") {
    return (
      <MapsContext.Provider value={{ isLoaded: false, noKey: true }}>
        {children}
      </MapsContext.Provider>
    );
  }

  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={LIBRARIES}>
      <MapsContext.Provider value={{ isLoaded: true }}>
        {children}
      </MapsContext.Provider>
    </LoadScript>
  );
}
