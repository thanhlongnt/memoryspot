import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { LoadScript, Libraries } from "@react-google-maps/api";

type MapsContextValue = { isLoaded: false; noKey?: boolean } | { isLoaded: true };

const MapsContext = createContext<MapsContextValue>({ isLoaded: false });

export function useMaps(): MapsContextValue {
  return useContext(MapsContext);
}

// Load once with ALL libraries needed across the whole app
const LIBRARIES: Libraries = ["places"];

export function MapsProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKey] = useState<string | null>(null); // null = still fetching

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json() as Promise<{ googleMapsApiKey: string }>)
      .then(({ googleMapsApiKey }) => setApiKey(googleMapsApiKey || ""))
      .catch(() => setApiKey(""));
  }, []);

  // Still fetching key — render children without map support
  if (apiKey === null) return <>{children}</>;

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
