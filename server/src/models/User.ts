import mongoose, { Document, Schema } from "mongoose";

export interface IUser {
  googleId: string;
  displayName: string;
  email: string;
  profilePicture: string;
}

export interface UserDocument extends IUser, Document {}

const userSchema = new Schema<UserDocument>(
  {
    googleId: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    email: { type: String, required: true },
    profilePicture: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model<UserDocument>("User", userSchema);
