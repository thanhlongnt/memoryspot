import axios from "axios";
import { Memory, MemoryMarker, MemoryPayload } from "../types/shared";

const api = axios.create({ withCredentials: true });

/**
 * Fetch all memories for the current user.
 * @param mood — optional mood filter
 */
export async function getAllMemories(mood?: string): Promise<Memory[]> {
  const params = mood ? { mood } : {};
  const { data } = await api.get<Memory[]>("/api/memories", { params });
  return data;
}

/**
 * Fetch only lat/lng/title for map markers.
 */
export async function getAllLocations(): Promise<MemoryMarker[]> {
  const { data } = await api.get<MemoryMarker[]>("/api/memories/locations");
  return data;
}

/**
 * Fetch a single memory by id.
 */
export async function getMemory(id: string): Promise<Memory> {
  const { data } = await api.get<Memory>(`/api/memories/${id}`);
  return data;
}

/**
 * Create a new memory.
 */
export async function createMemory(memory: MemoryPayload): Promise<Memory> {
  const { data } = await api.post<Memory>("/api/memories", memory);
  return data;
}

/**
 * Update an existing memory.
 */
export async function updateMemory(
  id: string,
  memory: MemoryPayload
): Promise<Memory> {
  const { data } = await api.put<Memory>(`/api/memories/${id}`, memory);
  return data;
}

/**
 * Delete a memory by id.
 */
export async function deleteMemory(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(
    `/api/memories/${id}`
  );
  return data;
}

/**
 * Check whether the user has any memories.
 */
export async function hasNoMemories(): Promise<boolean> {
  const memories = await getAllMemories();
  return memories.length === 0;
}

/**
 * Convert a File/Blob to a base64 Data URL.
 */
export function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!(file instanceof Blob)) {
      reject(new Error("Input must be a Blob or File"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
