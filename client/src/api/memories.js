import axios from "axios";

const api = axios.create({ withCredentials: true });

/**
 * Fetch all memories for the current user.
 * @param {string} [mood] — optional mood filter
 */
export async function getAllMemories(mood) {
  const params = mood ? { mood } : {};
  const { data } = await api.get("/api/memories", { params });
  return data;
}

/**
 * Fetch only lat/lng/title for map markers.
 */
export async function getAllLocations() {
  const { data } = await api.get("/api/memories/locations");
  return data;
}

/**
 * Fetch a single memory by id.
 */
export async function getMemory(id) {
  const { data } = await api.get(`/api/memories/${id}`);
  return data;
}

/**
 * Create a new memory.
 * @param {object} memory — { title, description, image, location, latitude, longitude, mood }
 */
export async function createMemory(memory) {
  const { data } = await api.post("/api/memories", memory);
  return data;
}

/**
 * Update an existing memory.
 */
export async function updateMemory(id, memory) {
  const { data } = await api.put(`/api/memories/${id}`, memory);
  return data;
}

/**
 * Delete a memory by id.
 */
export async function deleteMemory(id) {
  const { data } = await api.delete(`/api/memories/${id}`);
  return data;
}

/**
 * Check whether the user has any memories (replaces isEmptyDB).
 */
export async function hasNoMemories() {
  const memories = await getAllMemories();
  return memories.length === 0;
}

/**
 * Convert a File/Blob to a base64 Data URL.
 */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!(file instanceof Blob)) {
      reject(new Error("Input must be a Blob or File"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
