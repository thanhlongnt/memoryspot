export type Mood = "Nostalgic" | "Travel" | "Food" | "Music";

export interface Memory {
  _id: string;
  userId: string;
  title: string;
  description: string;
  image: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  mood: Mood;
  dateCreated: Date | string;
}

export interface MemoryMarker {
  _id: string;
  latitude: number;
  longitude: number;
  title: string;
  mood: Mood;
}

export interface MemoryPayload {
  title: string;
  description: string;
  image: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  mood: Mood;
}

export interface User {
  _id: string;
  displayName: string;
  email: string;
  profilePicture: string;
}
